/**
 * Data Validation Utilities
 * Validates stored data structure to prevent corruption
 */

import { AppData, Child, Measurement } from '../types';
import { logger } from './logger';

/**
 * Validates that a child object has all required fields
 */
function isValidChild(child: unknown): child is Child {
  if (!child || typeof child !== 'object') {
    return false;
  }

  const c = child as Partial<Child>;

  // Check required string fields
  if (!c.id || typeof c.id !== 'string') {
    return false;
  }
  if (!c.name || typeof c.name !== 'string') {
    return false;
  }
  if (!c.birthDate || typeof c.birthDate !== 'string') {
    return false;
  }
  if (!c.createdAt || typeof c.createdAt !== 'string') {
    return false;
  }
  if (!c.updatedAt || typeof c.updatedAt !== 'string') {
    return false;
  }

  // Check sex field
  if (c.sex !== 'male' && c.sex !== 'female') {
    return false;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(c.birthDate)) {
    return false;
  }

  // Validate ISO date strings
  if (isNaN(Date.parse(c.createdAt)) || isNaN(Date.parse(c.updatedAt))) {
    return false;
  }

  return true;
}

/**
 * Validates that a measurement object has all required fields
 */
function isValidMeasurement(measurement: unknown): measurement is Measurement {
  if (!measurement || typeof measurement !== 'object') {
    return false;
  }

  const m = measurement as Partial<Measurement>;

  // Check required string fields
  if (!m.id || typeof m.id !== 'string') {
    return false;
  }
  if (!m.childId || typeof m.childId !== 'string') {
    return false;
  }
  if (!m.date || typeof m.date !== 'string') {
    return false;
  }
  if (!m.createdAt || typeof m.createdAt !== 'string') {
    return false;
  }

  // Check measurement type
  if (
    m.type !== 'weight' &&
    m.type !== 'height' &&
    m.type !== 'headCircumference'
  ) {
    return false;
  }

  // Check value
  if (typeof m.value !== 'number' || isNaN(m.value) || m.value <= 0) {
    return false;
  }

  // Check notes (optional field)
  if (m.notes !== undefined && typeof m.notes !== 'string') {
    return false;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(m.date)) {
    return false;
  }

  // Validate ISO date string
  if (isNaN(Date.parse(m.createdAt))) {
    return false;
  }

  return true;
}

/**
 * Validates the entire AppData structure
 * Throws an error if validation fails with details about what's wrong
 */
export function validateAppData(data: unknown): AppData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data structure: not an object');
  }

  const { children, measurements } = data as Partial<AppData>;

  // Check that both arrays exist
  if (!Array.isArray(children)) {
    throw new Error('Invalid data structure: children is not an array');
  }

  if (!Array.isArray(measurements)) {
    throw new Error('Invalid data structure: measurements is not an array');
  }

  // Validate each child
  const validChildren: Child[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!isValidChild(child)) {
      throw new Error(
        `Invalid child data at index ${i}: missing or invalid required fields`,
      );
    }
    validChildren.push(child);
  }

  // Validate each measurement
  const validMeasurements: Measurement[] = [];
  for (let i = 0; i < measurements.length; i++) {
    const measurement = measurements[i];
    if (!isValidMeasurement(measurement)) {
      throw new Error(
        `Invalid measurement data at index ${i}: missing or invalid required fields`,
      );
    }
    validMeasurements.push(measurement);
  }

  // Check for orphaned measurements (measurements without corresponding children)
  const childIds = new Set(validChildren.map(c => c.id));
  const orphanedMeasurements = validMeasurements.filter(
    m => !childIds.has(m.childId),
  );

  if (orphanedMeasurements.length > 0) {
    logger.warn(
      `Found ${orphanedMeasurements.length} orphaned measurements that will be cleaned up`,
    );
    // Filter out orphaned measurements
    return {
      children: validChildren,
      measurements: validMeasurements.filter(m => childIds.has(m.childId)),
    };
  }

  return {
    children: validChildren,
    measurements: validMeasurements,
  };
}

/**
 * Attempts to recover from corrupted data by filtering out invalid entries
 * Returns a valid AppData structure with as much data as possible preserved
 */
export function recoverAppData(data: unknown): AppData {
  try {
    return validateAppData(data);
  } catch (error) {
    logger.warn('Data validation failed, attempting recovery:', error);

    // Try to recover what we can
    const recovered: AppData = {
      children: [],
      measurements: [],
    };

    if (data && typeof data === 'object') {
      const { children, measurements } = data as Partial<AppData>;

      // Recover valid children
      if (Array.isArray(children)) {
        recovered.children = children.filter(child => isValidChild(child));
      }

      // Recover valid measurements
      if (Array.isArray(measurements)) {
        const childIds = new Set(recovered.children.map(c => c.id));
        recovered.measurements = measurements.filter(
          m => isValidMeasurement(m) && childIds.has(m.childId),
        );
      }
    }

    logger.warn(
      `Recovered ${recovered.children.length} children and ${recovered.measurements.length} measurements`,
    );
    return recovered;
  }
}
