/**
 * Tests for appDataStore
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAppDataStore } from '../appDataStore';
import SecureStorage from '../../services/SecureStorage';
import { Child, Measurement } from '../../types';

// Mock SecureStorage
jest.mock('../../services/SecureStorage');

const mockChild: Child = {
  id: 'child-1',
  name: 'Test Child',
  birthDate: '2023-01-01',
  sex: 'male',
  createdAt: '2023-01-01T12:00:00Z',
  updatedAt: '2023-01-01T12:00:00Z',
};

const mockMeasurement: Measurement = {
  id: 'measurement-1',
  childId: 'child-1',
  date: '2023-06-01',
  type: 'weight',
  value: 10.5,
  createdAt: '2023-06-01T12:00:00Z',
};

describe('appDataStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state before each test
    act(() => {
      useAppDataStore.setState({
        children: [],
        measurements: [],
        loading: false,
        initialized: false,
        error: null,
      });
    });
  });

  describe('initialize', () => {
    it('should load data from SecureStorage on initialization', async () => {
      const mockData = {
        children: [mockChild],
        measurements: [mockMeasurement],
      };
      (SecureStorage.loadData as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
        expect(result.current.loading).toBe(false);
        expect(result.current.children).toEqual([mockChild]);
        expect(result.current.measurements).toEqual([mockMeasurement]);
        expect(SecureStorage.loadData).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle initialization error', async () => {
      const mockError = new Error('Failed to load data');
      (SecureStorage.loadData as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        try {
          await result.current.initialize();
        } catch (error) {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toEqual(mockError);
        expect(result.current.initialized).toBe(false);
      });
    });

    it('should not initialize twice', async () => {
      const mockData = {
        children: [mockChild],
        measurements: [mockMeasurement],
      };
      (SecureStorage.loadData as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
        await result.current.initialize(); // Call again
      });

      // Should only call loadData once
      expect(SecureStorage.loadData).toHaveBeenCalledTimes(1);
    });
  });

  describe('addChild', () => {
    it('should add a child and persist to storage', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [],
        measurements: [],
      });
      (SecureStorage.saveData as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        await result.current.addChild(mockChild);
      });

      await waitFor(() => {
        expect(result.current.children).toEqual([mockChild]);
        expect(SecureStorage.saveData).toHaveBeenCalledWith({
          children: [mockChild],
          measurements: [],
        });
      });
    });

    it('should rollback on save error', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [],
        measurements: [],
      });
      (SecureStorage.saveData as jest.Mock).mockRejectedValue(
        new Error('Save failed'),
      );

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        try {
          await result.current.addChild(mockChild);
        } catch (error) {
          // Expected to throw
        }
      });

      // Should rollback to empty array
      expect(result.current.children).toEqual([]);
    });
  });

  describe('updateChild', () => {
    it('should update a child and persist to storage', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [],
      });
      (SecureStorage.saveData as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      const updates = { name: 'Updated Child' };

      await act(async () => {
        await result.current.updateChild(mockChild.id, updates);
      });

      await waitFor(() => {
        expect(result.current.children[0].name).toBe('Updated Child');
        expect(result.current.children[0].updatedAt).toBeDefined();
        expect(SecureStorage.saveData).toHaveBeenCalled();
      });
    });

    it('should throw error if child not found', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [],
        measurements: [],
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await expect(
        act(async () => {
          await result.current.updateChild('non-existent', { name: 'Test' });
        }),
      ).rejects.toThrow('Child not found');
    });
  });

  describe('deleteChild', () => {
    it('should delete child and their measurements', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [mockMeasurement],
      });
      (SecureStorage.saveData as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        await result.current.deleteChild(mockChild.id);
      });

      await waitFor(() => {
        expect(result.current.children).toEqual([]);
        expect(result.current.measurements).toEqual([]);
        expect(SecureStorage.saveData).toHaveBeenCalledWith({
          children: [],
          measurements: [],
        });
      });
    });
  });

  describe('getChild', () => {
    it('should return child from memory', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [],
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      const child = result.current.getChild(mockChild.id);
      expect(child).toEqual(mockChild);
      // Should not call SecureStorage again
      expect(SecureStorage.loadData).toHaveBeenCalledTimes(1);
    });

    it('should return null if child not found', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [],
        measurements: [],
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      const child = result.current.getChild('non-existent');
      expect(child).toBeNull();
    });
  });

  describe('addMeasurement', () => {
    it('should add measurement and persist to storage', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [],
      });
      (SecureStorage.saveData as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        await result.current.addMeasurement(mockMeasurement);
      });

      await waitFor(() => {
        expect(result.current.measurements).toEqual([mockMeasurement]);
        expect(SecureStorage.saveData).toHaveBeenCalledWith({
          children: [mockChild],
          measurements: [mockMeasurement],
        });
      });
    });
  });

  describe('updateMeasurement', () => {
    it('should update measurement and persist to storage', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [mockMeasurement],
      });
      (SecureStorage.saveData as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        await result.current.updateMeasurement(mockMeasurement.id, {
          value: 12.0,
        });
      });

      await waitFor(() => {
        expect(result.current.measurements[0].value).toBe(12.0);
        expect(SecureStorage.saveData).toHaveBeenCalled();
      });
    });

    it('should throw error if measurement not found', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [],
        measurements: [],
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await expect(
        act(async () => {
          await result.current.updateMeasurement('non-existent', {
            value: 12.0,
          });
        }),
      ).rejects.toThrow('Measurement not found');
    });
  });

  describe('deleteMeasurement', () => {
    it('should delete measurement and persist to storage', async () => {
      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [mockMeasurement],
      });
      (SecureStorage.saveData as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      await act(async () => {
        await result.current.deleteMeasurement(mockMeasurement.id);
      });

      await waitFor(() => {
        expect(result.current.measurements).toEqual([]);
        expect(SecureStorage.saveData).toHaveBeenCalledWith({
          children: [mockChild],
          measurements: [],
        });
      });
    });
  });

  describe('getMeasurementsForChild', () => {
    it('should return measurements sorted by date', async () => {
      const measurement2: Measurement = {
        ...mockMeasurement,
        id: 'measurement-2',
        date: '2023-07-01',
        value: 11.0,
      };

      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [measurement2, mockMeasurement], // Reverse order
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      const measurements = result.current.getMeasurementsForChild(mockChild.id);

      expect(measurements).toEqual([mockMeasurement, measurement2]); // Sorted
      expect(measurements[0].date).toBe('2023-06-01');
      expect(measurements[1].date).toBe('2023-07-01');
    });

    it('should filter measurements by childId', async () => {
      const otherChildMeasurement: Measurement = {
        ...mockMeasurement,
        id: 'measurement-2',
        childId: 'other-child',
      };

      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [mockMeasurement, otherChildMeasurement],
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      const measurements = result.current.getMeasurementsForChild(mockChild.id);

      expect(measurements).toEqual([mockMeasurement]);
    });
  });

  describe('getMeasurementsByType', () => {
    it('should return measurements filtered by type', async () => {
      const heightMeasurement: Measurement = {
        ...mockMeasurement,
        id: 'measurement-2',
        type: 'height',
        value: 75.0,
      };

      (SecureStorage.loadData as jest.Mock).mockResolvedValue({
        children: [mockChild],
        measurements: [mockMeasurement, heightMeasurement],
      });

      const { result } = renderHook(() => useAppDataStore());

      await act(async () => {
        await result.current.initialize();
      });

      const weightMeasurements = result.current.getMeasurementsByType(
        mockChild.id,
        'weight',
      );
      const heightMeasurements = result.current.getMeasurementsByType(
        mockChild.id,
        'height',
      );

      expect(weightMeasurements).toEqual([mockMeasurement]);
      expect(heightMeasurements).toEqual([heightMeasurement]);
    });
  });
});
