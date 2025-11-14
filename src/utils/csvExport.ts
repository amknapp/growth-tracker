/**
 * CSV Export Utility
 * Handles exporting measurement data to CSV format
 */

import Papa from 'papaparse';
import { Child, Measurement } from '../types';

/**
 * Measurement data with child information for CSV export
 */
interface MeasurementExportRow {
  'Child Name': string;
  'Date': string;
  'Type': string;
  'Value': number;
  'Unit': string;
  'Notes': string;
  'Created At': string;
}

/**
 * Format measurement type for display
 */
const formatMeasurementType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    weight: 'Weight',
    height: 'Height',
    headCircumference: 'Head Circumference',
  };
  return typeMap[type] || type;
};

/**
 * Get the unit for a measurement type
 */
const getUnit = (type: string): string => {
  return type === 'weight' ? 'kg' : 'cm';
};

/**
 * Convert measurements to CSV format
 * @param measurements - Array of measurements to export
 * @param children - Array of child profiles (to include child names)
 * @returns CSV string
 */
export const generateMeasurementCSV = (
  measurements: Measurement[],
  children: Child[]
): string => {
  // Create a map of child IDs to child names for quick lookup
  const childMap = new Map(children.map(child => [child.id, child.name]));

  // Transform measurements into export rows
  const exportRows: MeasurementExportRow[] = measurements.map(measurement => ({
    'Child Name': childMap.get(measurement.childId) || 'Unknown',
    'Date': measurement.date,
    'Type': formatMeasurementType(measurement.type),
    'Value': measurement.value,
    'Unit': getUnit(measurement.type),
    'Notes': measurement.notes || '',
    'Created At': measurement.createdAt,
  }));

  // Sort by date (oldest first), then by created time
  exportRows.sort((a, b) => {
    const dateCompare = a.Date.localeCompare(b.Date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return a['Created At'].localeCompare(b['Created At']);
  });

  // Convert to CSV using papaparse
  const csv = Papa.unparse(exportRows, {
    header: true,
    quotes: true, // Quote all fields to handle commas in notes
  });

  return csv;
};

/**
 * Generate CSV filename with timestamp
 * @param childName - Optional child name to include in filename
 * @returns Filename string
 */
export const generateCSVFilename = (childName?: string): string => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedName = childName
    ? childName.replace(/[^a-zA-Z0-9]/g, '_')
    : 'all_children';
  return `growth_tracker_${sanitizedName}_${timestamp}.csv`;
};

/**
 * Filter measurements for a specific child
 * @param measurements - All measurements
 * @param childId - Child ID to filter by
 * @returns Filtered measurements
 */
export const filterMeasurementsByChild = (
  measurements: Measurement[],
  childId: string
): Measurement[] => {
  return measurements.filter(m => m.childId === childId);
};
