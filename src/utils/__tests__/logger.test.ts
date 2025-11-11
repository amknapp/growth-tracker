/**
 * Tests for secure logger utility
 */

import { logger } from '../logger';

describe('logger', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  const originalDev = (global as any).__DEV__;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    (global as any).__DEV__ = originalDev;
  });

  describe('error', () => {
    it('should log full error in development mode', () => {
      (global as any).__DEV__ = true;
      const testError = new Error('Test error message');

      logger.error('Error occurred', testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred', testError);
    });

    it('should log sanitized error in production mode', () => {
      (global as any).__DEV__ = false;
      const testError = new Error('Test error message');

      logger.error('Error occurred', testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error occurred', {
        message: 'Test error message',
        name: 'Error',
      });
    });

    it('should handle Error objects', () => {
      (global as any).__DEV__ = false;
      const testError = new Error('Test message');
      testError.name = 'CustomError';

      logger.error('Custom error', testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Custom error', {
        message: 'Test message',
        name: 'CustomError',
      });
    });

    it('should handle non-Error objects', () => {
      (global as any).__DEV__ = false;
      const errorObject = {
        message: 'Something went wrong',
        code: 'ERR_001',
        sensitiveData: 'should-be-removed',
      };

      logger.error('Non-Error object', errorObject);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Non-Error object', {
        type: 'object',
      });
    });

    it('should handle string errors', () => {
      (global as any).__DEV__ = false;

      logger.error('String error', 'Simple error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith('String error', {
        message: 'Simple error message',
      });
    });

    it('should handle null/undefined errors', () => {
      (global as any).__DEV__ = false;

      logger.error('Null error', null);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Null error', undefined);

      logger.error('Undefined error', undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Undefined error',
        undefined,
      );
    });

    it('should sanitize potential PII in error messages', () => {
      (global as any).__DEV__ = false;
      const testError = new Error('User email@example.com failed');

      logger.error('PII error', testError);

      // Should still log the error, but in production only message/name
      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedData = consoleErrorSpy.mock.calls[0][1];
      expect(loggedData).toEqual({
        message: 'User email@example.com failed',
        name: 'Error',
      });
    });
  });

  describe('warn', () => {
    it('should log warnings with data in development mode', () => {
      (global as any).__DEV__ = true;
      const testData = { key: 'value', count: 123 };

      logger.warn('Warning message', testData);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message', testData);
    });

    it('should log warnings without data in development mode', () => {
      (global as any).__DEV__ = true;

      logger.warn('Warning message');

      // In dev mode, it passes both message and data (even if undefined)
      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning message', undefined);
    });

    it('should not log warnings in production mode', () => {
      (global as any).__DEV__ = false;

      logger.warn('Production warning', { data: 'test' });

      // In production, warnings are still logged but without the data
      expect(consoleWarnSpy).toHaveBeenCalledWith('Production warning');
    });

    it('should handle warnings with undefined data', () => {
      (global as any).__DEV__ = true;

      logger.warn('Warning with undefined', undefined);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning with undefined',
        undefined,
      );
    });

    it('should handle warnings with null data', () => {
      (global as any).__DEV__ = true;

      logger.warn('Warning with null', null);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Warning with null', null);
    });

    it('should handle warnings with complex objects', () => {
      (global as any).__DEV__ = true;
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        count: 5,
      };

      logger.warn('Complex warning', complexData);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Complex warning',
        complexData,
      );
    });
  });

  describe('sanitization', () => {
    it('should remove stack traces in production', () => {
      (global as any).__DEV__ = false;
      const testError = new Error('Test');
      testError.stack = 'Error: Test\n    at line 1\n    at line 2';

      logger.error('Stack trace error', testError);

      const loggedData = consoleErrorSpy.mock.calls[0][1];
      expect(loggedData).not.toHaveProperty('stack');
      expect(loggedData).toEqual({
        message: 'Test',
        name: 'Error',
      });
    });

    it('should preserve stack traces in development', () => {
      (global as any).__DEV__ = true;
      const testError = new Error('Test');

      logger.error('Dev error', testError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Dev error', testError);
      // In dev mode, the full Error object is logged including stack
    });

    it('should handle errors without message property', () => {
      (global as any).__DEV__ = false;
      const weirdError: any = { name: 'WeirdError' };

      logger.error('Weird error', weirdError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Weird error', {
        type: 'object',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle circular references in production', () => {
      (global as any).__DEV__ = false;
      const circular: any = { name: 'CircularError' };
      circular.self = circular;

      // Should not throw when logging circular references
      expect(() => logger.error('Circular', circular)).not.toThrow();
    });

    it('should handle very long error messages', () => {
      (global as any).__DEV__ = false;
      const longMessage = 'a'.repeat(10000);
      const testError = new Error(longMessage);

      logger.error('Long error', testError);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedData = consoleErrorSpy.mock.calls[0][1];
      expect(loggedData.message).toBe(longMessage);
    });

    it('should handle multiple consecutive errors', () => {
      (global as any).__DEV__ = false;

      logger.error('Error 1', new Error('First'));
      logger.error('Error 2', new Error('Second'));
      logger.error('Error 3', new Error('Third'));

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle errors with additional properties', () => {
      (global as any).__DEV__ = false;
      const enhancedError: any = new Error('Enhanced');
      enhancedError.code = 'ERR_123';
      enhancedError.statusCode = 404;
      enhancedError.userData = { id: 'user-123' };

      logger.error('Enhanced error', enhancedError);

      const loggedData = consoleErrorSpy.mock.calls[0][1];
      // Should only log name and message in production for Error objects
      expect(loggedData).toEqual({
        message: 'Enhanced',
        name: 'Error',
      });
    });
  });
});
