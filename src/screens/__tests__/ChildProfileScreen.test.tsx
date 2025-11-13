/**
 * ChildProfileScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ChildProfileScreen from '../ChildProfileScreen';
import { useAppDataStore } from '../../store/appDataStore';
import { Child, Measurement } from '../../types';

// Mock dependencies
jest.mock('../../store/appDataStore');

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

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
  };
});

// Store the callback for useFocusEffect
let focusEffectCallback: any;

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      dispatch: jest.fn(),
    }),
    DrawerActions: {
      openDrawer: jest.fn(),
    },
    useFocusEffect: (callback: any) => {
      focusEffectCallback = callback;
      // Call it immediately to trigger data loading
      callback();
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

  const mockGetChild = jest.fn().mockReturnValue(mockChild);
  const mockGetMeasurementsForChild = jest
    .fn()
    .mockReturnValue(mockMeasurements);
  const mockDeleteMeasurement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChild.mockReturnValue(mockChild);
    mockGetMeasurementsForChild.mockReturnValue(mockMeasurements);
    (useAppDataStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({
        getChild: mockGetChild,
        getMeasurementsForChild: mockGetMeasurementsForChild,
        deleteMeasurement: mockDeleteMeasurement,
      }),
    );
  });

  it('should render child profile correctly', async () => {
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue(
      mockMeasurements,
    );

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
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue(
      mockMeasurements,
    );

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
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue([]);

    const { getAllByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      const noDataElements = getAllByText('No data');
      expect(noDataElements.length).toBe(3); // Weight, height, head circumference
    });
  });

  it('should navigate to AddMeasurement when button is pressed', async () => {
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue(
      mockMeasurements,
    );

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
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue(
      mockMeasurements,
    );

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
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue(
      mockMeasurements,
    );

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
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue([]);

    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('All Measurements (0)')).toBeTruthy();
      expect(getByText('No measurements yet')).toBeTruthy();
    });
  });

  it('should show error when child is not found', async () => {
    (mockGetChild as jest.Mock).mockReturnValue(null);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue([]);

    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText('Child not found')).toBeTruthy();
    });
  });

  it('should handle load data error', async () => {
    (mockGetChild as jest.Mock).mockRejectedValue(new Error('Storage error'));
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue([]);

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

    (mockGetChild as jest.Mock).mockReturnValue(femaleChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue([]);

    const { getByText } = render(
      <ChildProfileScreen navigation={mockNavigation} route={mockRoute} />,
    );

    await waitFor(() => {
      expect(getByText(/Girl/)).toBeTruthy();
    });
  });

  it('should format measurement types correctly in history', async () => {
    (mockGetChild as jest.Mock).mockReturnValue(mockChild);
    (mockGetMeasurementsForChild as jest.Mock).mockReturnValue(
      mockMeasurements,
    );

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
