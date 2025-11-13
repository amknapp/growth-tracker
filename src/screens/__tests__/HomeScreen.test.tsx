/**
 * HomeScreen Component Tests
 */

import React from 'react';
import {
  render,
  waitFor,
  act,
  fireEvent,
  within,
  screen,
} from '@testing-library/react-native';
import { Alert } from 'react-native'; // Add this import
import HomeScreen from '../HomeScreen';
import { Child } from '../../types';

// Mock dependencies
jest.mock('../../store/appDataStore');
jest.mock('../../hooks/useChildren');

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    }),
    DrawerActions: {
      openDrawer: jest.fn(),
    },
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const { Text } = jest.requireActual('react-native');
  return ({ name, ...props }: { name: string; [key: string]: any }) => (
    <Text {...props}>{name}</Text>
  );
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

// Mock Alert
jest.spyOn(Alert, 'alert');
jest.mock('react-native-gesture-handler', () => {
  const { View, Text, TouchableOpacity } = jest.requireActual('react-native'); // Use actual View, Text, TouchableOpacity

  // Mock Animated.AnimatedInterpolation
  const mockAnimatedInterpolation = () => ({
    interpolate: jest.fn(() => 1), // Return a fixed value for scale
  });

  const Swipeable = ({
    children,
    renderRightActions,
  }: {
    children: React.ReactNode;
    renderRightActions?: (
      progressAnimatedValue: any,
      dragAnimatedValue: any,
    ) => React.ReactNode;
  }) => {
    return (
      <View>
        {children}
        {/* Render the right actions directly for testing purposes */}
        {renderRightActions &&
          renderRightActions(
            mockAnimatedInterpolation(),
            mockAnimatedInterpolation(),
          )}
      </View>
    );
  };
  return {
    Swipeable,
    // Mock other exports if needed, e.g., GestureHandlerRootView
  };
});

import { useChildren } from '../../hooks/useChildren';
import { useAppDataStore } from '../../store/appDataStore';

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

  const mockDeleteChild = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useChildren as jest.Mock).mockReturnValue({
      children: mockChildren,
      loading: false,
      error: null,
      refreshChildren: jest.fn(),
    });
    (useAppDataStore as unknown as jest.Mock).mockImplementation(selector =>
      selector({
        deleteChild: mockDeleteChild,
      }),
    );
  });

  it('should render children list when loaded', async () => {
    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await waitFor(() => {
      expect(getByText('Test Child 1')).toBeTruthy();
      expect(getByText('Test Child 2')).toBeTruthy();
    });
  });

  it('should display empty state when no children', async () => {
    (useChildren as jest.Mock).mockReturnValue({
      children: [],
      loading: false,
      error: null,
      refreshChildren: jest.fn(),
    });

    const { getByText } = render(<HomeScreen navigation={null as any} />);

    await waitFor(() => {
      expect(getByText(/No Children Added/i)).toBeTruthy();
    });
  });

  it('should display child age information', async () => {
    const { getAllByText } = render(<HomeScreen navigation={null as any} />);

    await waitFor(() => {
      // Should display age for each child (format may vary)
      const allText = getAllByText(/year|month/i);
      expect(allText.length).toBeGreaterThan(0);
    });
  });

  it('should handle delete child', async () => {
    mockDeleteChild.mockResolvedValue(undefined);

    const { getByText } = render(<HomeScreen navigation={null as any} />);

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
        expect.any(Array),
      );
    });

    // Simulate pressing the 'Delete' button in the Alert
    const deleteButton = (Alert.alert as jest.Mock).mock.calls[0][2][1];
    await act(async () => {
      await deleteButton.onPress();
    });

    await waitFor(() => {
      expect(mockDeleteChild).toHaveBeenCalledWith('1');
    });
  });
});
