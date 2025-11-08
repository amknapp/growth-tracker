/**
 * AddChildScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddChildScreen from '../AddChildScreen';
import SecureStorage from '../../services/SecureStorage';

// Mock dependencies
jest.mock('../../services/SecureStorage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  DrawerActions: {
    openDrawer: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('AddChildScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (SecureStorage.addChild as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    expect(getByText('Add Child')).toBeTruthy();
    expect(getByPlaceholderText("Enter child's name")).toBeTruthy();
    expect(getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)')).toBeTruthy();
    expect(getByText('Boy')).toBeTruthy();
    expect(getByText('Girl')).toBeTruthy();
    expect(getByText('Save Child Profile')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should allow entering name', () => {
    const { getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    expect(nameInput.props.value).toBe('John Doe');
  });

  it('should allow entering birth date', () => {
    const { getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    expect(dateInput.props.value).toBe('2023-01-15');
  });

  it('should allow selecting sex', () => {
    const { getByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const girlButton = getByText('Girl');
    fireEvent.press(girlButton);

    // Girl button should be selected (test would need to check styles or state)
    expect(girlButton).toBeTruthy();

    const boyButton = getByText('Boy');
    fireEvent.press(boyButton);

    expect(boyButton).toBeTruthy();
  });

  it('should show error when name is empty', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a name');
    });
  });

  it('should show error when birth date is empty', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a birth date');
    });
  });

  it('should show error for invalid date format', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '01/15/2023'); // Wrong format

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter date in YYYY-MM-DD format');
    });
  });

  it('should show error for future birth date', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, futureDateStr);

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Birth date cannot be in the future');
    });
  });

  it('should save child successfully', async () => {
    (SecureStorage.addChild as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(SecureStorage.addChild).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          birthDate: '2023-01-15',
          sex: 'male', // Default
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Child profile added successfully',
        expect.any(Array)
      );
    });

    // Wait for the saving state to be false
    await waitFor(() => {
      expect(queryByText('Saving...')).toBeNull();
    });
  });

  it('should save child with female sex', async () => {
    (SecureStorage.addChild as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'Jane Doe');

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    const girlButton = getByText('Girl');
    fireEvent.press(girlButton);

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(SecureStorage.addChild).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          sex: 'female',
        })
      );
    });

    // Wait for the saving state to be false
    await waitFor(() => {
      expect(queryByText('Saving...')).toBeNull();
    });
  });

  it('should handle save error', async () => {
    (SecureStorage.addChild as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const { getByText, getByPlaceholderText, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to save child profile'
      );
    });

    // Wait for the saving state to be false
    await waitFor(() => {
      expect(queryByText('Saving...')).toBeNull();
    });
  });

  it('should call goBack when cancel is pressed', () => {
    const { getByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('should trim whitespace from name', async () => {
    (SecureStorage.addChild as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, '  John Doe  ');

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(SecureStorage.addChild).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe', // Trimmed
        })
      );
    });

    // Wait for the saving state to be false
    await waitFor(() => {
      expect(queryByText('Saving...')).toBeNull();
    });
  });

  it('should disable save button while saving', async () => {
    (SecureStorage.addChild as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText, getByPlaceholderText, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const dateInput = getByPlaceholderText('YYYY-MM-DD (e.g., 2023-06-15)');
    fireEvent.changeText(dateInput, '2023-01-15');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    // Button should show "Saving..."
    await waitFor(() => {
      expect(getByText('Saving...')).toBeTruthy();
    });

    // Advance timers to allow the save operation to complete
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Wait for the saving state to be false
    await waitFor(() => {
      expect(queryByText('Saving...')).toBeNull();
    });
  });
});
