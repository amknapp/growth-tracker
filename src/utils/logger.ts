/**
 * Secure Logging Utility
 * Sanitizes sensitive data before logging
 */

/**
 * Sanitizes an error object to remove potentially sensitive information
 */
function sanitizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Explicitly don't include stack trace or any data properties
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return { type: typeof error };
}

/**
 * Secure logger that sanitizes output in production
 */
export const logger = {
  /**
   * Log an error message
   * In development: logs full error
   * In production: sanitizes error and sends to error tracking (if configured)
   */
  error: (message: string, error?: unknown) => {
    if (__DEV__) {
      // In development, log everything for debugging
      console.error(message, error);
    } else {
      // In production, sanitize and log safely
      const sanitized = error ? sanitizeError(error) : undefined;
      console.error(message, sanitized);

      // TODO: Send to error tracking service (e.g., Sentry, Bugsnag)
      // ErrorTrackingService.log(message, sanitized);
    }
  },

  /**
   * Log a warning message
   */
  warn: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.warn(message, data);
    } else {
      // In production, only log the message, not the data
      console.warn(message);
    }
  },

  /**
   * Log an info message (development only)
   */
  info: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.log(message, data);
    }
    // Don't log info in production
  },

  /**
   * Log a debug message (development only)
   */
  debug: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.log('[DEBUG]', message, data);
    }
    // Don't log debug in production
  },
};
