/**
 * HomeScreen Component Tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';
import SecureStorage from '../../services/SecureStorage';
import { Child } from '../../types';

// Mock dependencies
jest.mock('../../services/SecureStorage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    dispatch: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useFocusEffect: (callback: () => void) => {
    callback();
  },
  DrawerActions: {
    openDrawer: jest.fn(),
  },
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: 'Swipeable',
}));

describe('HomeScreen', () => {
  const mockChildren: Child[] = [
    {
      id: '1',
      name: 'Test Child 1',
      birthDate: '2022-01-01',
      sex: 'male',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Test Child 2',
      birthDate: '2023-06-15',
      sex: 'female',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (SecureStorage.getChildren as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByText } = render(<HomeScreen navigation={null as any} />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should render children list when loaded', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(mockChildren);

    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await waitFor(() => {
      expect(getByText('Test Child 1')).toBeTruthy();
      expect(getByText('Test Child 2')).toBeTruthy();
    });
  });

  it('should display empty state when no children', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await waitFor(() => {
      expect(getByText(/No children added yet/i)).toBeTruthy();
    });
  });

  it('should display child age information', async () => {
    (SecureStorage.getChildren as jest.Mock).mockResolvedValue(mockChildren);

    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await waitFor(() => {
      // Should display age for each child (format may vary)
      const allText = getByText(/year|month/i);
      expect(allText).toBeTruthy();
    });
  });
});
