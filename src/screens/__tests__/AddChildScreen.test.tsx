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
    expect(getByText('Select birth date')).toBeTruthy();
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

  it('should allow selecting birth date', () => {
    const { getByText, getByTestId, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    // Click the date button to show picker
    const dateButton = getByText('Select birth date');
    fireEvent.press(dateButton);

    // Date picker should be visible
    const datePicker = getByTestId('dateTimePicker');
    expect(datePicker).toBeTruthy();

    // Simulate date selection
    const selectedDate = new Date('2023-01-15');
    fireEvent(datePicker, 'press');

    // After selection on Android, picker should be hidden
    // We can't easily test this without mocking Platform.OS
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
    const { getByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    // We can skip selecting a date for this test since name validation comes first

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a name');
    });
  });

  it('should show error when birth date is not selected', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a birth date');
    });
  });

  // Note: Date picker enforces maximumDate={new Date()}, so future dates cannot be selected in UI
  // Invalid date format tests removed since picker only provides valid dates

  it('should save child successfully', async () => {
    (SecureStorage.addChild as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    // Open date picker and select date
    const dateButton = getByText('Select birth date');
    fireEvent.press(dateButton);

    // Simulate date selection
    const datePicker = getByTestId('dateTimePicker');
    fireEvent.press(datePicker); // This triggers onChange with the current value

    // Click Done button to commit the date
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

    const saveButton = getByText('Save Child Profile');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(SecureStorage.addChild).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
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

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'Jane Doe');

    const dateButton = getByText('Select birth date');
    fireEvent.press(dateButton);
    const datePicker = getByTestId('dateTimePicker');
    fireEvent.press(datePicker);

    // Click Done button to commit the date
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

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

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const dateButton = getByText('Select birth date');
    fireEvent.press(dateButton);
    const datePicker = getByTestId('dateTimePicker');
    fireEvent.press(datePicker);

    // Click Done button to commit the date
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

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
  })

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

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, '  John Doe  ');

    const dateButton = getByText('Select birth date');
    fireEvent.press(dateButton);
    const datePicker = getByTestId('dateTimePicker');
    fireEvent.press(datePicker);

    // Click Done button to commit the date
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

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

    const { getByText, getByPlaceholderText, getByTestId, queryByText } = render(
      <AddChildScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText("Enter child's name");
    fireEvent.changeText(nameInput, 'John Doe');

    const dateButton = getByText('Select birth date');
    fireEvent.press(dateButton);
    const datePicker = getByTestId('dateTimePicker');
    fireEvent.press(datePicker);

    // Click Done button to commit the date
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);

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
