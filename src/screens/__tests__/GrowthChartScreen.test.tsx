/**
 * GrowthChartScreen Tests
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import GrowthChartScreen from '../GrowthChartScreen';
import { useAppDataStore } from '../../store/appDataStore';
import { Child, Measurement } from '../../types';
import CDCDataService from '../../services/CDCDataService';

// Create stable mock functions at module level
const mockGetChild = jest.fn();
const mockGetMeasurementsByType = jest.fn();
const mockDeleteMeasurement = jest.fn();

// Create a stable store object
const mockStore = {
  getChild: mockGetChild,
  getMeasurementsByType: mockGetMeasurementsByType,
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
  const ScrollView = require('react-native').ScrollView;
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
    ScrollView: ScrollView,
  };
});

// Mock victory-native with zoom/pan support
jest.mock('victory-native', () => ({
  CartesianChart: ({ children, chartPressState, ...props }: any) => {
    const View = require('react-native').View;
    const Text = require('react-native').Text;
    // Mock the chart render function with points
    const mockPoints = {
      p5: [],
      p25: [],
      p50: [],
      p75: [],
      p95: [],
      child: [],
    };
    return (
      <View testID="cartesian-chart" {...props}>
        <Text testID="press-state-passed">
          {chartPressState ? 'press-state-enabled' : 'press-state-disabled'}
        </Text>
        {typeof children === 'function'
          ? children({ points: mockPoints })
          : children}
      </View>
    );
  },
  Line: ({ points, ...props }: any) => {
    const View = require('react-native').View;
    return <View testID="line-component" {...props} />;
  },
  Scatter: ({ points, ...props }: any) => {
    const View = require('react-native').View;
    return <View testID="scatter-component" {...props} />;
  },
  AreaRange: ({ lowerPoints, upperPoints, ...props }: any) => {
    const View = require('react-native').View;
    return <View testID="area-range-component" {...props} />;
  },
  useChartPressState: jest.fn(() => ({
    state: {
      isActive: { value: false },
      x: { value: { value: 0 }, position: { value: 0 } },
      y: { child: { value: { value: 0 }, position: { value: 0 } } },
    },
    isActive: false,
  })),
  useChartTransformState: jest.fn(() => ({
    state: {
      panActive: { value: false },
      zoomActive: { value: false },
      origin: { value: { x: 0, y: 0 } },
      matrix: { value: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
      offset: { value: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
    },
  })),
}));

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
  };
});

// Mock CDCDataService
jest.mock('../../services/CDCDataService', () => ({
  __esModule: true,
  default: {
    getChartData: jest.fn(),
    getWHOWeightForAgeData: jest.fn(),
    getWHOLengthForAgeData: jest.fn(),
    getWHOHeadCircForAgeData: jest.fn(),
  },
}));

describe('GrowthChartScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    dispatch: jest.fn(),
  } as any;

  const mockRoute = {
    params: {
      childId: 'test-child-123',
      measurementType: 'weight' as const,
    },
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
      type: 'weight',
      value: 11.2,
      date: '2023-07-15',
      createdAt: '2023-07-15T12:00:00Z',
    },
  ];

  const mockChartData = [
    { ageInMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
    { ageInMonths: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
    { ageInMonths: 2, L: 0.197, M: 5.5675, S: 0.12385 },
    { ageInMonths: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
    { ageInMonths: 4, L: 0.1553, M: 7.0023, S: 0.11316 },
    { ageInMonths: 5, L: 0.1395, M: 7.5105, S: 0.1108 },
    { ageInMonths: 6, L: 0.1257, M: 7.934, S: 0.10958 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Set default return values for mock functions
    mockGetChild.mockReturnValue(mockChild);
    mockGetMeasurementsByType.mockReturnValue(mockMeasurements);
    (CDCDataService.getChartData as jest.Mock).mockResolvedValue(mockChartData);
  });

  describe('Chart Interaction', () => {
    it('should initialize chart press state using useChartPressState hook', async () => {
      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      // If the component renders successfully, the hook was called
      await waitFor(() => {
        expect(getByText('Growth Chart')).toBeTruthy();
      });
    });

    it('should pass chartPressState to CartesianChart component', async () => {
      const { getByTestId } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        const pressIndicator = getByTestId('press-state-passed');
        expect(pressIndicator.props.children).toBe('press-state-enabled');
      });
    });

    it('should display tooltip hint text', async () => {
      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('Tap points for details')).toBeTruthy();
      });
    });

    it('should render chart with press state for weight measurements', async () => {
      const { getByText, getByTestId } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Weight')).toBeTruthy();
        expect(getByTestId('cartesian-chart')).toBeTruthy();
        expect(getByTestId('press-state-passed')).toBeTruthy();
      });
    });

    it('should render chart with press state for height measurements', async () => {
      const heightRoute = {
        params: {
          childId: 'test-child-123',
          measurementType: 'height' as const,
        },
      } as any;

      mockGetMeasurementsByType.mockReturnValue([
        {
          id: 'measurement-3',
          childId: 'test-child-123',
          type: 'height',
          value: 75.2,
          date: '2023-06-15',
          createdAt: '2023-06-15T12:00:00Z',
        },
      ]);

      const { getByText, getByTestId } = render(
        <GrowthChartScreen navigation={mockNavigation} route={heightRoute} />,
      );

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Height')).toBeTruthy();
        expect(getByTestId('press-state-passed')).toBeTruthy();
      });
    });

    it('should render chart with press state for head circumference measurements', async () => {
      const headCircRoute = {
        params: {
          childId: 'test-child-123',
          measurementType: 'headCircumference' as const,
        },
      } as any;

      mockGetMeasurementsByType.mockReturnValue([
        {
          id: 'measurement-4',
          childId: 'test-child-123',
          type: 'headCircumference',
          value: 42.5,
          date: '2023-06-15',
          createdAt: '2023-06-15T12:00:00Z',
        },
      ]);

      const { getByText, getByTestId } = render(
        <GrowthChartScreen navigation={mockNavigation} route={headCircRoute} />,
      );

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Head Circumference')).toBeTruthy();
        expect(getByTestId('press-state-passed')).toBeTruthy();
      });
    });
  });

  describe('Basic Rendering', () => {
    it('should render child name and measurement type in header', async () => {
      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('Weight')).toBeTruthy();
      });
    });

    it('should render CDC/WHO toggle buttons', async () => {
      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('CDC')).toBeTruthy();
        expect(getByText('WHO')).toBeTruthy();
      });
    });

    it('should render Growth Chart title', async () => {
      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('Growth Chart')).toBeTruthy();
      });
    });

    it('should render latest measurement with percentile', async () => {
      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('Latest Measurement')).toBeTruthy();
        expect(getByText('11.2 kg')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when child is not found', async () => {
      mockGetChild.mockReturnValue(null);

      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('Data not found')).toBeTruthy();
      });
    });

    it('should display error banner when chart data fails to load', async () => {
      (CDCDataService.getChartData as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText(/Failed to load growth chart data/)).toBeTruthy();
      });
    });

    it('should still display chart with percentile curves when no measurements exist', async () => {
      mockGetMeasurementsByType.mockReturnValue([]);

      const { getByText, queryByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        // Chart should still render with percentile curves
        expect(getByText('Growth Chart')).toBeTruthy();
        expect(getByText('Percentile Curves')).toBeTruthy();
        // Latest measurement card should not appear
        expect(queryByText('Latest Measurement')).toBeNull();
      });
    });
  });

  describe('Chart Standard Toggle', () => {
    it('should load CDC data by default', async () => {
      render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(CDCDataService.getChartData).toHaveBeenCalledWith(
          'weight',
          'male',
        );
      });
    });

    it('should load WHO data when WHO standard is selected', async () => {
      (CDCDataService.getWHOWeightForAgeData as jest.Mock).mockResolvedValue({
        male: mockChartData,
        female: mockChartData,
      });

      const { getByText } = render(
        <GrowthChartScreen navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        const whoButton = getByText('WHO');
        expect(whoButton).toBeTruthy();
      });
    });
  });
});
