/**
 * CDCDataService Tests
 */

import CDCDataService from '../CDCDataService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

global.fetch = jest.fn();

describe('CDCDataService', () => {
  const mockCDCResponse = `Sex,Agemos,L,M,S
1,0,0.3487,3.3464,0.14602
1,1,0.2297,4.4709,0.13395
2,0,0.3809,3.2322,0.14171
2,1,0.2684,4.1873,0.13086`;

  const mockWHOResponse = `Month,L,M,S,2nd (2.3rd),5th,10th,25th,50th,75th,90th,95th,98th (97.7th)
0,0.3487,3.3464,0.14602,2.459312,2.603994,2.757621,3.027282,3.3464,3.686659,4.011499,4.214527,4.419354
1,0.2297,4.4709,0.13395,3.39089,3.566165,3.752603,4.080792,4.4709,4.889123,5.290726,5.542933,5.798331`;

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getChartData', () => {
    it('should fetch and parse CDC weight data', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        });

      const data = await CDCDataService.getChartData('weight', 'male');

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it.skip('should return cached data when available', async () => {
      const cachedData = {
        male: [{ ageInMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 }],
        female: [{ ageInMonths: 0, L: 0.3809, M: 3.2322, S: 0.14171 }],
        lastUpdate: Date.now(),
      };

      // Mock the cache validity check and cache retrieval for both infant and child datasets
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(Date.now().toString()) // Cache validity for infant
        .mockResolvedValueOnce(JSON.stringify(cachedData)) // Cache data for infant
        .mockResolvedValueOnce(Date.now().toString()) // Cache validity for child
        .mockResolvedValueOnce(JSON.stringify(cachedData)); // Cache data for child

      const data = await CDCDataService.getChartData('weight', 'male');

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      // Should use cache, so fetch shouldn't be called
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        CDCDataService.getChartData('weight', 'male')
      ).rejects.toThrow();
    });
  });

  describe('getWHOWeightForAgeData', () => {
    it('should fetch and parse WHO weight data', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockWHOResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockWHOResponse),
        });

      const data = await CDCDataService.getWHOWeightForAgeData();

      expect(data).toBeDefined();
      expect(data.male).toBeDefined();
      expect(data.female).toBeDefined();
      expect(Array.isArray(data.male)).toBe(true);
      expect(Array.isArray(data.female)).toBe(true);
    });

    it('should cache WHO data after fetching', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockWHOResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockWHOResponse),
        });

      await CDCDataService.getWHOWeightForAgeData();

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      await CDCDataService.clearCache();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringContaining('@cdc_'),
          expect.stringContaining('@who_'),
        ])
      );
    });
  });

  describe('Data parsing', () => {
    it('should correctly parse CDC CSV format', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        });

      const data = await CDCDataService.getChartData('weight', 'male');

      expect(data[0]).toHaveProperty('ageInMonths');
      expect(data[0]).toHaveProperty('L');
      expect(data[0]).toHaveProperty('M');
      expect(data[0]).toHaveProperty('S');
    });

    it.skip('should separate male and female data correctly', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        });

      const maleData = await CDCDataService.getChartData('weight', 'male');
      const femaleData = await CDCDataService.getChartData('weight', 'female');

      expect(maleData).not.toEqual(femaleData);
    });

    it('should parse WHO CSV format with Month column', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockWHOResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockWHOResponse),
        });

      const data = await CDCDataService.getWHOWeightForAgeData();

      expect(data.male[0].ageInMonths).toBe(0);
      expect(data.male[0].M).toBeCloseTo(3.3464, 2);
    });
  });

  describe('Cache management', () => {
    it('should check cache validity based on timestamp', async () => {
      const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        oldTimestamp.toString()
      );

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(mockCDCResponse),
        });

      // Should fetch new data because cache is too old
      await CDCDataService.getChartData('weight', 'male');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should use expired cache as fallback when fetch fails', async () => {
      const expiredInfantData = {
        male: [{ ageInMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 }],
        female: [{ ageInMonths: 0, L: 0.3809, M: 3.2322, S: 0.14171 }],
        lastUpdate: Date.now() - (31 * 24 * 60 * 60 * 1000),
      };

      const expiredChildData = {
        male: [{ ageInMonths: 48, L: 0.3487, M: 15.0, S: 0.14602 }],
        female: [{ ageInMonths: 48, L: 0.3809, M: 14.5, S: 0.14171 }],
        lastUpdate: Date.now() - (31 * 24 * 60 * 60 * 1000),
      };

      const oldTimestamp = (Date.now() - (31 * 24 * 60 * 60 * 1000)).toString();

      // Mock AsyncStorage to handle requests based on cache key
      // Since Promise.all runs getCDCData calls in parallel, we need to handle calls by key
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === '@cdc_last_update@cdc_weight_for_age_infant') {
          return Promise.resolve(oldTimestamp);
        }
        if (key === '@cdc_weight_for_age_infant') {
          return Promise.resolve(JSON.stringify(expiredInfantData));
        }
        if (key === '@cdc_last_update@cdc_weight_for_age_child') {
          return Promise.resolve(oldTimestamp);
        }
        if (key === '@cdc_weight_for_age_child') {
          return Promise.resolve(JSON.stringify(expiredChildData));
        }
        return Promise.resolve(null);
      });

      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const data = await CDCDataService.getChartData('weight', 'male');

      // The result will be merged from infant + child datasets
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2); // One from infant, one from child
    });
  });

  describe('Data merging', () => {
    it('should merge infant and child datasets correctly', async () => {
      const infantResponse = `Sex,Agemos,L,M,S
1,0,0.3487,3.3464,0.14602
1,24,0.0,10.0,0.12`;

      const childResponse = `Sex,Agemos,L,M,S
1,36,0.0,12.0,0.11
1,48,0.0,14.0,0.10`;

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(infantResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: jest.fn().mockResolvedValue(childResponse),
        });

      const data = await CDCDataService.getChartData('weight', 'male');

      // Should have data from both infant and child datasets
      expect(data.some(d => d.ageInMonths <= 36)).toBe(true);
      expect(data.some(d => d.ageInMonths > 36)).toBe(true);
    });
  });
});
