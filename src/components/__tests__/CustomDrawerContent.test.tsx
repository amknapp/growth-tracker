/**
 * CustomDrawerContent Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CustomDrawerContent from '../CustomDrawerContent';
import SecureStorage from '../../services/SecureStorage';
import { Child } from '../../types';

// Mock dependencies
jest.mock('../../services/SecureStorage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    dispatch: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  CommonActions: {
    navigate: jest.fn(params => params),
  },
}));
jest.mock('@react-navigation/drawer', () => ({
  DrawerContentScrollView: ({ children }: any) => children,
}));
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#7E57C2',
      primaryLight: '#B39DDB',
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

describe('CustomDrawerContent', () => {
  const mockProps = {
    navigation: {
      navigate: jest.fn(),
      closeDrawer: jest.fn(),
    },
    state: {
      routes: [],
      index: 0,
      key: 'drawer-key',
      routeNames: [],
      history: [],
      type: 'drawer' as const,
      stale: false,
    },
    descriptors: {},
  } as any;

  const mockChildren: Child[] = [
    {
      id: 'child-1',
      name: 'John Doe',
      birthDate: '2023-01-15',
      sex: 'male',
      createdAt: '2023-01-15T12:00:00Z',
      updatedAt: '2023-01-15T12:00:00Z',
    },
    {
      id: 'child-2',
      name: 'Jane Doe',
      birthDate: '2022-06-20',
      sex: 'female',
      createdAt: '2022-06-20T12:00:00Z',
      updatedAt: '2022-06-20T12:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    expect(getByText('Growth Tracker')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Children')).toBeTruthy();
    expect(getByText('Legal')).toBeTruthy();
  });

  it('should display children list', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(mockChildren);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Doe')).toBeTruthy();
    });
  });

  it('should display empty state when no children', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    await waitFor(() => {
      expect(getByText('No children added yet')).toBeTruthy();
    });
  });

  it('should display loading state', () => {
    (SecureStorage.getChildren as jest.Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should navigate to Home when Home is pressed', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    const homeButton = getByText('Home');
    fireEvent.press(homeButton);

    await waitFor(() => {
      expect(mockProps.navigation.closeDrawer).toHaveBeenCalled();
    });
  });

  it('should navigate to child profile when child is pressed', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(mockChildren);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    const childButton = getByText('John Doe');
    fireEvent.press(childButton);

    await waitFor(() => {
      expect(mockProps.navigation.closeDrawer).toHaveBeenCalled();
    });
  });

  it('should navigate to Privacy Policy when pressed', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    const privacyButton = getByText('Privacy Policy');
    fireEvent.press(privacyButton);

    expect(mockProps.navigation.navigate).toHaveBeenCalledWith('PrivacyPolicy');
  });

  it('should navigate to Terms of Service when pressed', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    const termsButton = getByText('Terms of Service');
    fireEvent.press(termsButton);

    expect(mockProps.navigation.navigate).toHaveBeenCalledWith(
      'TermsOfService',
    );
  });

  it('should display footer with version and data storage info', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    expect(getByText(/Growth Tracker v1.0/i)).toBeTruthy();
    expect(getByText(/Data stored locally on your device/i)).toBeTruthy();
  });

  it('should display age for each child', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(mockChildren);

    const { getAllByText } = render(<CustomDrawerContent {...mockProps} />);

    await waitFor(() => {
      // Age text should be present (format varies based on current date)
      const ageElements = getAllByText(/months?|years?/i);
      expect(ageElements.length).toBeGreaterThan(0);
    });
  });
});
