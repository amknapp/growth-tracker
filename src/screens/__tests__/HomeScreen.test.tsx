/**
 * HomeScreen Component Tests
 */

import React from 'react';
import { render, waitFor, act, fireEvent, within, screen } from '@testing-library/react-native';
import { Alert } from 'react-native'; // Add this import
import HomeScreen from '../HomeScreen';
import SecureStorage from '../../services/SecureStorage';
import { Child } from '../../types';
import { useFocusEffect } from '@react-navigation/native'; // Add this import

// Mock dependencies
jest.mock('../../services/SecureStorage');
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    }),
    useFocusEffect: jest.fn(), // Mock useFocusEffect here
    DrawerActions: {
      openDrawer: jest.fn(),
    },
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ name, ...props }) => <Text {...props}>{name}</Text>;
});

// Mock Alert
jest.spyOn(Alert, 'alert');
jest.mock('react-native-gesture-handler', () => {
  const { View, Text, TouchableOpacity } = jest.requireActual('react-native'); // Use actual View, Text, TouchableOpacity

  // Mock Animated.AnimatedInterpolation
  const mockAnimatedInterpolation = () => ({
    interpolate: jest.fn(() => 1), // Return a fixed value for scale
  });

  const Swipeable = ({ children, renderRightActions }) => {
    return (
      <View>
        {children}
        {/* Render the right actions directly for testing purposes */}
        {renderRightActions && renderRightActions(mockAnimatedInterpolation(), mockAnimatedInterpolation())}
      </View>
    );
  };
  return {
    Swipeable,
    // Mock other exports if needed, e.g., GestureHandlerRootView
  };
});

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

  let resolveGetChildren: (value: Child[]) => void;
  let rejectGetChildren: (reason?: any) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getChildren to return a pending promise by default
    (SecureStorage.getChildren as jest.Mock).mockImplementation(
      () => new Promise((resolve, reject) => {
        resolveGetChildren = resolve;
        rejectGetChildren = reject;
      })
    );
  });

  it('should render children list when loaded', async () => {
    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await act(async () => {
      (useFocusEffect as jest.Mock).mock.calls[0][0](); // Trigger useFocusEffect
      resolveGetChildren(mockChildren);
    });

    await waitFor(() => {
      expect(getByText('Test Child 1')).toBeTruthy();
      expect(getByText('Test Child 2')).toBeTruthy();
    });
  });

  it('should display empty state when no children', async () => {
    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await act(async () => {
      (useFocusEffect as jest.Mock).mock.calls[0][0](); // Trigger useFocusEffect
      resolveGetChildren([]);
    });

    await waitFor(() => {
      expect(getByText(/No Children Added/i)).toBeTruthy();
    });
  });

  it('should display child age information', async () => {
    const { getAllByText } = render(<HomeScreen navigation={null as any} />);

    await act(async () => {
      (useFocusEffect as jest.Mock).mock.calls[0][0](); // Trigger useFocusEffect
      resolveGetChildren(mockChildren);
    });

    await waitFor(() => {
      // Should display age for each child (format may vary)
      const allText = getAllByText(/year|month/i);
      expect(allText.length).toBeGreaterThan(0);
    });
  });

  it('should handle delete child', async () => {
    (SecureStorage.deleteChild as jest.Mock).mockResolvedValue(undefined);

    const { getByText, queryByText } = render(<HomeScreen navigation={null as any} />);

    await act(async () => {
      (useFocusEffect as jest.Mock).mock.calls[0][0](); // Trigger useFocusEffect
      resolveGetChildren(mockChildren); // Resolve initial load
    });

    await waitFor(() => {
      expect(getByText('Test Child 1')).toBeTruthy();
    });

    const child1Card = getByText('Test Child 1').parent?.parent; // Get the parent of the child name, which is the card
    expect(child1Card).toBeTruthy(); // Ensure we found the card

    // Click delete button directly as right actions are always rendered
    fireEvent.press(screen.getByTestId('delete-button-1'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Child',
        'Are you sure you want to delete Test Child 1? This will also delete all their measurements.',
        expect.any(Array)
      );
    });

    // Simulate pressing the 'Delete' button in the Alert
    const deleteButton = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => {
      // Re-mock getChildren to return the list without the deleted child
      (SecureStorage.getChildren as jest.Mock).mockResolvedValue([mockChildren[1]]);
      deleteButton.onPress();
    });

    await waitFor(() => {
      expect(SecureStorage.deleteChild).toHaveBeenCalledWith('1');
      expect(queryByText('Test Child 1')).toBeNull(); // Child 1 should be gone
      expect(getByText('Test Child 2')).toBeTruthy(); // Child 2 should still be there
    });
  });
});
