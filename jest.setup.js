// Jest setup file

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  // Store the current onChange handler so tests can trigger it
  let currentOnChange = null;
  let currentValue = null;

  const MockDateTimePicker = (props) => {
    currentOnChange = props.onChange;
    currentValue = props.value;

    return React.createElement(
      TouchableOpacity,
      {
        testID: props.testID || 'dateTimePicker',
        onPress: () => {
          // When pressed in tests, call onChange with the current value
          if (props.onChange) {
            props.onChange({}, props.value);
          }
        },
      },
      React.createElement(Text, {}, 'DateTimePicker Mock')
    );
  };

  // Expose a way for tests to simulate date selection
  MockDateTimePicker.selectDate = (date) => {
    if (currentOnChange) {
      currentOnChange({}, date);
    }
  };

  return MockDateTimePicker;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    RectButton: View,
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    }),
    useFocusEffect: jest.fn(),
    DrawerActions: {
      openDrawer: jest.fn(),
    },
    CommonActions: {
      navigate: jest.fn(),
    },
  };
});

// Mock @react-navigation/drawer
jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
}));

// Mock @shopify/react-native-skia
jest.mock('@shopify/react-native-skia', () => ({
  matchFont: jest.fn(() => ({})),
  Skia: {
    Font: jest.fn(),
  },
}));

// Mock victory-native
jest.mock('victory-native', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    CartesianChart: View,
    Line: View,
    Scatter: View,
    AreaRange: View,
    useFont: jest.fn(() => null),
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();
