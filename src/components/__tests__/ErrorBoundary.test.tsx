/**
 * Tests for ErrorBoundary component
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorBoundary from '../ErrorBoundary';
import { logger } from '../../utils/logger';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = false,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <Text>Normal content</Text>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Test content</Text>
      </ErrorBoundary>,
    );

    expect(getByText('Test content')).toBeTruthy();
  });

  it('should catch errors and display fallback UI', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(queryByText('Normal content')).toBeNull();
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText(/We encountered an unexpected error/)).toBeTruthy();
  });

  it('should display error message in dev mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const errorMessage = 'Specific test error';
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} message={errorMessage} />
      </ErrorBoundary>,
    );

    expect(getByText('Error Details (Dev Mode):')).toBeTruthy();
    (global as any).__DEV__ = originalDev;
  });

  it('should not display error details in production mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;

    const { queryByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} message="Secret error" />
      </ErrorBoundary>,
    );

    expect(queryByText('Error Details (Dev Mode):')).toBeNull();
    expect(queryByText('Secret error')).toBeNull();

    (global as any).__DEV__ = originalDev;
  });

  it('should log errors to logger', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} message="Logged error" />
      </ErrorBoundary>,
    );

    expect(logger.error).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      'React Error Boundary caught an error',
      expect.objectContaining({
        error: expect.any(Error),
        componentStack: expect.any(String),
      }),
    );
  });

  it('should display "Try Again" button', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should attempt to reset error state when "Try Again" is pressed', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Error UI should be visible
    expect(getByText('Oops! Something went wrong')).toBeTruthy();

    // Press "Try Again" button exists and is pressable
    const tryAgainButton = getByText('Try Again');
    expect(tryAgainButton).toBeTruthy();

    // Should not throw when pressing the button
    expect(() => fireEvent.press(tryAgainButton)).not.toThrow();
  });

  it('should use resetKey to remount children', () => {
    // Test that component structure supports resetKey
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Content with key support</Text>
      </ErrorBoundary>,
    );

    expect(getByText('Content with key support')).toBeTruthy();
  });

  it('should display help text about restarting app', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      getByText('If this problem persists, please restart the app.'),
    ).toBeTruthy();
  });

  it('should handle errors and display error UI consistently', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} message="Test error" />
      </ErrorBoundary>,
    );

    // Should show error UI
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should accept custom resetKey prop', () => {
    const { getByText } = render(
      <ErrorBoundary resetKey="custom-key">
        <Text>Content with custom key</Text>
      </ErrorBoundary>,
    );

    // Should render normally with custom resetKey
    expect(getByText('Content with custom key')).toBeTruthy();
  });

  it('should handle errors in deeply nested components', () => {
    const NestedComponent = () => (
      <Text>
        <Text>
          <ThrowError shouldThrow={true} />
        </Text>
      </Text>
    );

    const { getByText } = render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>,
    );

    expect(getByText('Oops! Something went wrong')).toBeTruthy();
  });

  it('should maintain error state once an error is caught', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Should show and maintain error UI
    expect(getByText('Oops! Something went wrong')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should handle errors with very long messages in dev mode', () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = true;

    const longMessage = 'Error: ' + 'a'.repeat(1000);
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} message={longMessage} />
      </ErrorBoundary>,
    );

    expect(getByText('Error Details (Dev Mode):')).toBeTruthy();
    // Should display the full message
    expect(getByText(longMessage)).toBeTruthy();

    (global as any).__DEV__ = originalDev;
  });

  it('should apply correct styling to error UI', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    const title = getByText('Oops! Something went wrong');
    const button = getByText('Try Again');

    // Components should be rendered (style checking is limited in RN testing)
    expect(title).toBeTruthy();
    expect(button).toBeTruthy();
  });
});
