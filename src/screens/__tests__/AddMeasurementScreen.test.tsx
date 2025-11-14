/**
 * AddMeasurementScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddMeasurementScreen from '../AddMeasurementScreen';
import { useAppDataStore } from '../../store/appDataStore';

// Mock dependencies
jest.mock('../../store/appDataStore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  DrawerActions: {
    openDrawer: jest.fn(),
  },
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

jest.spyOn(Alert, 'alert');

describe('AddMeasurementScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as any;

  const mockRoute = {
    params: { childId: 'test-child-123' },
  } as any;

  const mockAddMeasurement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppDataStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({
        addMeasurement: mockAddMeasurement,
      }),
    );
  });

  it('should render correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByText('Add Measurement')).toBeTruthy();
    expect(getByPlaceholderText('Enter weight in kg')).toBeTruthy();
    expect(getByPlaceholderText('Enter height in cm')).toBeTruthy();
    expect(getByPlaceholderText('Enter head circumference in cm')).toBeTruthy();
    expect(getByText('Date')).toBeTruthy(); // Date label instead of placeholder
    expect(getByText('Save Measurement')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should allow entering weight', () => {
    const { getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, '10.5');

    expect(weightInput.props.value).toBe('10.5');
  });

  it('should show error when no measurements entered', async () => {
    const { getByText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Please enter at least one measurement',
      );
    });
  });

  it('should show error for invalid weight', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, 'abc');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Weight must be between 0.1 and 300 kg',
      );
    });
  });

  it('should show error for negative weight', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, '-5');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Weight must be between 0.1 and 300 kg',
      );
    });
  });

  it('should show error for invalid height', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const heightInput = getByPlaceholderText('Enter height in cm');
    fireEvent.changeText(heightInput, 'invalid');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Height must be between 20 and 250 cm',
      );
    });
  });

  it('should show error for invalid head circumference', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const headInput = getByPlaceholderText('Enter head circumference in cm');
    fireEvent.changeText(headInput, 'invalid');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Head circumference must be between 20 and 100 cm',
      );
    });
  });

  it('should save single measurement successfully', async () => {
    (mockAddMeasurement as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, '10.5');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAddMeasurement).toHaveBeenCalledWith(
        expect.objectContaining({
          childId: 'test-child-123',
          type: 'weight',
          value: 10.5,
        }),
      );
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  it('should save multiple measurements successfully', async () => {
    (mockAddMeasurement as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, '10.5');

    const heightInput = getByPlaceholderText('Enter height in cm');
    fireEvent.changeText(heightInput, '75.2');

    const headInput = getByPlaceholderText('Enter head circumference in cm');
    fireEvent.changeText(headInput, '42.5');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAddMeasurement).toHaveBeenCalledTimes(3);
      expect(mockAddMeasurement).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'weight', value: 10.5 }),
      );
      expect(mockAddMeasurement).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'height', value: 75.2 }),
      );
      expect(mockAddMeasurement).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'headCircumference', value: 42.5 }),
      );
    });
  });

  it('should handle save error', async () => {
    (mockAddMeasurement as jest.Mock).mockRejectedValue(
      new Error('Storage error'),
    );

    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, '10.5');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to save measurements',
      );
    });
  });

  it('should call goBack when cancel is pressed', () => {
    const { getByText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('should show saving state', async () => {
    (mockAddMeasurement as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100)),
    );

    const { getByText, getByPlaceholderText } = render(
      <AddMeasurementScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const weightInput = getByPlaceholderText('Enter weight in kg');
    fireEvent.changeText(weightInput, '10.5');

    const saveButton = getByText('Save Measurement');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('Saving...')).toBeTruthy();
    });
  });
});
