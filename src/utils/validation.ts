/**
 * Input Validation and Sanitization Utilities
 * Provides secure input handling for user data
 */

/**
 * Sanitizes a name input by removing potentially harmful characters
 * and enforcing length limits
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML brackets
    .substring(0, 100); // Enforce max length
}

/**
 * Validates that a name meets requirements
 */
export function isValidName(name: string): boolean {
  const sanitized = sanitizeName(name);
  // Allow Unicode letters (including José, François, Müller, 中文, العربية, etc.),
  // spaces, hyphens, and apostrophes
  // Must be at least 1 character and no more than 100
  return (
    /^[\p{L}\s\-']+$/u.test(sanitized) &&
    sanitized.length >= 1 &&
    sanitized.length <= 100
  );
}

/**
 * Sanitizes notes/text input by removing harmful characters
 * and enforcing length limits
 */
export function sanitizeNotes(notes: string): string {
  return notes
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML/XML brackets
    .substring(0, 500); // Enforce max length
}

/**
 * Validates that a numeric measurement value is valid
 */
export function isValidMeasurementValue(
  value: number,
  type: 'weight' | 'height' | 'headCircumference',
): boolean {
  if (isNaN(value) || !isFinite(value)) {
    return false;
  }

  // Define reasonable ranges for each measurement type
  const ranges = {
    weight: { min: 0.1, max: 300 }, // kg: premature babies to very large adults
    height: { min: 20, max: 250 }, // cm: premature babies to very tall adults
    headCircumference: { min: 20, max: 100 }, // cm: premature babies to adults
  };

  const range = ranges[type];
  return value >= range.min && value <= range.max;
}

/**
 * Validates that a date is not in the future
 */
export function isValidDate(date: Date): boolean {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  // Normalize to start of day to avoid timezone issues
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  return date <= today;
}

/**
 * Gets user-friendly error message for validation failures
 */
export function getValidationErrorMessage(
  type: 'name' | 'notes' | 'measurement' | 'date',
  details?: string,
): string {
  const messages = {
    name: 'Name must contain only letters, spaces, hyphens, and apostrophes (1-100 characters)',
    notes: 'Notes are too long (maximum 500 characters)',
    measurement: details || 'Measurement value is out of valid range',
    date: 'Date cannot be in the future',
  };

  return messages[type];
}
