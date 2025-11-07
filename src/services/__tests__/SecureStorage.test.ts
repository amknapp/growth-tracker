/**
 * SecureStorage Service Tests
 */

import SecureStorage from '../SecureStorage';
import * as Keychain from 'react-native-keychain';
import { Child, Measurement, AppData } from '../../types';

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  },
}));

describe('SecureStorage', () => {
  const mockChild: Child = {
    id: '1',
    name: 'Test Child',
    birthDate: '2022-01-01',
    sex: 'male',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockMeasurement: Measurement = {
    id: '1',
    childId: '1',
    type: 'weight',
    value: 10.5,
    date: '2024-01-15',
    createdAt: '2024-01-15T00:00:00.000Z',
  };

  const mockAppData: AppData = {
    children: [mockChild],
    measurements: [mockMeasurement],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveData', () => {
    it('should save data to secure storage', async () => {
      await SecureStorage.saveData(mockAppData);

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'growth_tracker_data',
        JSON.stringify(mockAppData),
        expect.objectContaining({
          service: 'growth_tracker_data',
        })
      );
    });

    it('should throw error when save fails', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(SecureStorage.saveData(mockAppData)).rejects.toThrow(
        'Failed to save data securely'
      );
    });
  });

  describe('loadData', () => {
    it('should load data from secure storage', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        username: 'growth_tracker_data',
        password: JSON.stringify(mockAppData),
      });

      const data = await SecureStorage.loadData();

      expect(data).toEqual(mockAppData);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'growth_tracker_data',
      });
    });

    it('should return empty data structure when no data exists', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);

      const data = await SecureStorage.loadData();

      expect(data).toEqual({
        children: [],
        measurements: [],
      });
    });

    it('should throw error when load fails', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      await expect(SecureStorage.loadData()).rejects.toThrow(
        'Failed to load data securely'
      );
    });
  });

  describe('addChild', () => {
    it('should add a new child to storage', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify({ children: [], measurements: [] }),
      });

      await SecureStorage.addChild(mockChild);

      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'growth_tracker_data',
        JSON.stringify({
          children: [mockChild],
          measurements: [],
        }),
        expect.any(Object)
      );
    });
  });

  describe('updateChild', () => {
    it('should update an existing child', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockAppData),
      });

      const updates = { name: 'Updated Name' };
      await SecureStorage.updateChild('1', updates);

      const savedData = JSON.parse(
        (Keychain.setGenericPassword as jest.Mock).mock.calls[0][1]
      );

      expect(savedData.children[0].name).toBe('Updated Name');
      expect(savedData.children[0].updatedAt).toBeDefined();
    });

    it('should throw error when child not found', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockAppData),
      });

      await expect(
        SecureStorage.updateChild('non-existent', { name: 'Test' })
      ).rejects.toThrow('Child not found');
    });
  });

  describe('deleteChild', () => {
    it('should delete a child and their measurements', async () => {
      const dataWithMultipleChildren: AppData = {
        children: [
          mockChild,
          {
            ...mockChild,
            id: '2',
            name: 'Another Child',
          },
        ],
        measurements: [
          mockMeasurement,
          {
            ...mockMeasurement,
            id: '2',
            childId: '2',
          },
        ],
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(dataWithMultipleChildren),
      });

      await SecureStorage.deleteChild('1');

      const savedData = JSON.parse(
        (Keychain.setGenericPassword as jest.Mock).mock.calls[0][1]
      );

      expect(savedData.children).toHaveLength(1);
      expect(savedData.children[0].id).toBe('2');
      expect(savedData.measurements).toHaveLength(1);
      expect(savedData.measurements[0].childId).toBe('2');
    });
  });

  describe('getChildren', () => {
    it('should return all children', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockAppData),
      });

      const children = await SecureStorage.getChildren();

      expect(children).toHaveLength(1);
      expect(children[0]).toEqual(mockChild);
    });

    it('should return empty array when no children', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify({ children: [], measurements: [] }),
      });

      const children = await SecureStorage.getChildren();

      expect(children).toEqual([]);
    });
  });

  describe('getChild', () => {
    it('should return a specific child by ID', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockAppData),
      });

      const child = await SecureStorage.getChild('1');

      expect(child).toEqual(mockChild);
    });

    it('should return null when child not found', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(mockAppData),
      });

      const child = await SecureStorage.getChild('non-existent');

      expect(child).toBeNull();
    });
  });

  describe('addMeasurement', () => {
    it('should add a new measurement', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify({ children: [mockChild], measurements: [] }),
      });

      await SecureStorage.addMeasurement(mockMeasurement);

      const savedData = JSON.parse(
        (Keychain.setGenericPassword as jest.Mock).mock.calls[0][1]
      );

      expect(savedData.measurements).toHaveLength(1);
      expect(savedData.measurements[0]).toEqual(mockMeasurement);
    });
  });

  describe('deleteMeasurement', () => {
    it('should delete a measurement by ID', async () => {
      const dataWithMultipleMeasurements: AppData = {
        children: [mockChild],
        measurements: [
          mockMeasurement,
          {
            ...mockMeasurement,
            id: '2',
            value: 11.0,
          },
        ],
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(dataWithMultipleMeasurements),
      });

      await SecureStorage.deleteMeasurement('1');

      const savedData = JSON.parse(
        (Keychain.setGenericPassword as jest.Mock).mock.calls[0][1]
      );

      expect(savedData.measurements).toHaveLength(1);
      expect(savedData.measurements[0].id).toBe('2');
    });
  });

  describe('getMeasurementsForChild', () => {
    it('should return all measurements for a specific child', async () => {
      const dataWithMultipleChildren: AppData = {
        children: [mockChild],
        measurements: [
          mockMeasurement,
          {
            ...mockMeasurement,
            id: '2',
            childId: '2',
          },
        ],
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(dataWithMultipleChildren),
      });

      const measurements = await SecureStorage.getMeasurementsForChild('1');

      expect(measurements).toHaveLength(1);
      expect(measurements[0].childId).toBe('1');
    });

    it('should sort measurements by date (oldest first)', async () => {
      const dataWithMultipleMeasurements: AppData = {
        children: [mockChild],
        measurements: [
          { ...mockMeasurement, date: '2024-01-15' },
          { ...mockMeasurement, id: '2', date: '2024-01-20' },
          { ...mockMeasurement, id: '3', date: '2024-01-10' },
        ],
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(dataWithMultipleMeasurements),
      });

      const measurements = await SecureStorage.getMeasurementsForChild('1');

      expect(measurements[0].date).toBe('2024-01-10');
      expect(measurements[1].date).toBe('2024-01-15');
      expect(measurements[2].date).toBe('2024-01-20');
    });
  });

  describe('getMeasurementsByType', () => {
    it('should return measurements filtered by type', async () => {
      const dataWithMultipleMeasurements: AppData = {
        children: [mockChild],
        measurements: [
          { ...mockMeasurement, type: 'weight' },
          { ...mockMeasurement, id: '2', type: 'height' },
          { ...mockMeasurement, id: '3', type: 'weight' },
        ],
      };

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({
        password: JSON.stringify(dataWithMultipleMeasurements),
      });

      const measurements = await SecureStorage.getMeasurementsByType(
        '1',
        'weight'
      );

      expect(measurements).toHaveLength(2);
      expect(measurements.every(m => m.type === 'weight')).toBe(true);
    });
  });
});
