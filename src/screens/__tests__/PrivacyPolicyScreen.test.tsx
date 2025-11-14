/**
 * PrivacyPolicyScreen Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import PrivacyPolicyScreen from '../PrivacyPolicyScreen';

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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 44,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    dispatch: jest.fn(),
  }),
  DrawerActions: {
    openDrawer: jest.fn(),
  },
}));

describe('PrivacyPolicyScreen', () => {
  it('should render correctly', () => {
    const { getAllByText } = render(<PrivacyPolicyScreen />);

    // Check for key privacy policy content
    expect(getAllByText(/Privacy Policy/i).length).toBeGreaterThan(0);
  });

  it('should display zero data collection message', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText(/We collect ZERO data/i)).toBeTruthy();
  });

  it('should display key privacy commitments', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText(/No servers/i)).toBeTruthy();
    expect(getByText(/No analytics/i)).toBeTruthy();
  });

  it('should display encryption information', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText(/AES-256/i)).toBeTruthy();
  });

  it('should mention CDC data usage', () => {
    const { getAllByText } = render(<PrivacyPolicyScreen />);

    expect(getAllByText(/CDC/i).length).toBeGreaterThan(0);
  });

  it('should have last updated date', () => {
    const { getAllByText } = render(<PrivacyPolicyScreen />);

    expect(getAllByText(/Last Updated/i).length).toBeGreaterThan(0);
  });
});
