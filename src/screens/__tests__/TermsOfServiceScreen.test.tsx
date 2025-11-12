/**
 * TermsOfServiceScreen Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import TermsOfServiceScreen from '../TermsOfServiceScreen';

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#7E57C2',
      background: '#f5f5f5',
      card: '#fff',
      text: '#333',
      textSecondary: '#666',
      textLight: '#999',
      border: '#e0e0e0',
      error: '#FF3B30',
    },
    isDark: false,
    colorScheme: 'light',
  }),
}));

describe('TermsOfServiceScreen', () => {
  it('should render correctly', () => {
    const { getAllByText } = render(<TermsOfServiceScreen />);

    // Check for key terms of service content
    expect(getAllByText(/Terms of Service/i).length).toBeGreaterThan(0);
  });

  it('should display medical disclaimer', () => {
    const { getAllByText } = render(<TermsOfServiceScreen />);

    expect(getAllByText(/Medical Disclaimer/i).length).toBeGreaterThan(0);
  });

  it('should display key legal sections', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText(/Acceptance of Terms/i)).toBeTruthy();
    expect(getByText(/Use at Your Own Risk/i)).toBeTruthy();
    expect(getByText(/No Warranty/i)).toBeTruthy();
    expect(getByText(/Limitation of Liability/i)).toBeTruthy();
  });

  it('should warn about not substituting medical advice', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(
      getByText(/NOT a substitute for professional medical advice/i),
    ).toBeTruthy();
  });

  it('should mention data responsibility', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText(/Data Responsibility/i)).toBeTruthy();
  });

  it('should have last updated date', () => {
    const { getAllByText } = render(<TermsOfServiceScreen />);

    expect(getAllByText(/Last Updated/i).length).toBeGreaterThan(0);
  });

  it('should include indemnification', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText(/Indemnification/i)).toBeTruthy();
  });

  it('should include governing law', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText(/Governing Law/i)).toBeTruthy();
  });
});
