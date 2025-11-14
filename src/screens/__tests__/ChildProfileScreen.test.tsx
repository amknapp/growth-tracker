/**
 * ChildProfileScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ChildProfileScreen from '../ChildProfileScreen';
import { useAppDataStore } from '../../store/appDataStore';
import { Child, Measurement } from '../../types';

// Create stable mock functions at module level
const mockGetChild = jest.fn();
const mockGetMeasurementsForChild = jest.fn();
const mockDeleteMeasurement = jest.fn();

// Create a stable store object
const mockStore = {
  getChild: mockGetChild,
  getMeasurementsForChild: mockGetMeasurementsForChild,
  deleteMeasurement: mockDeleteMeasurement,
};

// Mock the store to return stable function references
jest.mock('../../store/appDataStore', () => ({
  useAppDataStore: (selector: any) => selector(mockStore),
}));

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

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
  };
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const React = require('react');
  return {
    ...actualNav,
    useNavigation: () => ({
      dispatch: jest.fn(),
    }),
    DrawerActions: {
      openDrawer: jest.fn(),
    },
    useFocusEffect: (callback: any) => {
      // Use useEffect to call the callback once on mount
      React.useEffect(() => {
        callback();
        return () => {}; // Cleanup function
      }, []);
    },
  };
});

jest.spyOn(Alert, 'alert');

describe('ChildProfileScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    dispatch: jest.fn(),
  } as any;

  const mockRoute = {
    params: { childId: 'test-child-123' },
  } as any;

  const mockChild: Child = {
    id: 'test-child-123',
    name: 'John Doe',
    birthDate: '2023-01-15',
    sex: 'male',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-01-15T12:00:00Z',
  };

  const mockMeasurements: Measurement[] = [
    {
      id: 'measurement-1',
      childId: 'test-child-123',
      type: 'weight',
      value: 10.5,
      date: '2023-06-15',
      createdAt: '2023-06-15T12:00:00Z',
    },
    {
      id: 'measurement-2',
      childId: 'test-child-123',
      type: 'height',
      value: 75.2,
      date: '2023-06-15',
      createdAt: '2023-06-15T12:00:00Z',
    },
    {
      id: 'measurement-3',
      childId: 'test-child-123',
      type: 'headCircumference',
      value: 42.5,
      date: '2023-06-15',
      notes: 'Test notes',
      createdAt: '2023-06-15T12:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default return values for mock functions
    mockGetChild.mockReturnValue(mockChild);
    mockGetMeasurementsForChild.mockReturnValue(mockMeasurements);
  });

  it('should render child profile correctly', async () => {
    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText(/Boy/)).toBeTruthy();
      expect(getByText('Born: 2023-01-15')).toBeTruthy();
    });
  });

  it('should display latest measurements', async () => {
    const { getAllByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getAllByText('10.5 kg').length).toBeGreaterThan(0);
      expect(getAllByText('75.2 cm').length).toBeGreaterThan(0);
      expect(getAllByText('42.5 cm').length).toBeGreaterThan(0);
    });
  });

  it('should display "No data" for measurement types with no data', async () => {
    mockGetMeasurementsForChild.mockReturnValue([]);

    const { getAllByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      const noDataElements = getAllByText('No data');
      expect(noDataElements.length).toBe(3); // Weight, height, head circumference
    });
  });

  it('should navigate to AddMeasurement when button is pressed', async () => {
    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('+ Add Measurement')).toBeTruthy();
    });

    const addButton = getByText('+ Add Measurement');
    fireEvent.press(addButton);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('AddMeasurement', {
      childId: 'test-child-123',
    });
  });

  it('should navigate to GrowthChart when measurement card is pressed', async () => {
    const { getAllByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getAllByText('Weight').length).toBeGreaterThan(0);
    });

    // Get the first Weight element (from the Latest Measurements section)
    const weightCard = getAllByText('Weight')[0];
    fireEvent.press(weightCard);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('GrowthChart', {
      childId: 'test-child-123',
      measurementType: 'weight',
    });
  });

  it('should display all measurements in history', async () => {
    const { getByText, getAllByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('All Measurements (3)')).toBeTruthy();
      expect(getAllByText('2023-06-15').length).toBeGreaterThan(0);
      expect(getByText('Test notes')).toBeTruthy();
    });
  });

  it('should display empty state when no measurements', async () => {
    mockGetMeasurementsForChild.mockReturnValue([]);

    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('All Measurements (0)')).toBeTruthy();
      expect(getByText('No measurements yet')).toBeTruthy();
    });
  });

  it('should show error when child is not found', async () => {
    mockGetChild.mockReturnValue(null);
    mockGetMeasurementsForChild.mockReturnValue([]);

    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('Child not found')).toBeTruthy();
    });
  });

  it('should handle load data error', async () => {
    // Mock getChild to throw an error
    mockGetChild.mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load profile data',
      );
    });
  });

  it('should display female child correctly', async () => {
    const femaleChild: Child = {
      ...mockChild,
      sex: 'female',
    };

    mockGetChild.mockReturnValue(femaleChild);
    mockGetMeasurementsForChild.mockReturnValue([]);

    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText(/Girl/)).toBeTruthy();
    });
  });

  it('should format measurement types correctly in history', async () => {
    const { getAllByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getAllByText('Weight').length).toBeGreaterThan(0);
      expect(getAllByText('Height').length).toBeGreaterThan(0);
      expect(getAllByText('Head Circumference').length).toBeGreaterThan(0);
    });
  });
});
