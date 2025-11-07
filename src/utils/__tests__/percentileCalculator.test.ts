/**
 * Percentile Calculator Tests
 */

import {
  calculateZScore,
  zScoreToPercentile,
  zScoreToValue,
  interpolateLMS,
  calculatePercentile,
  getPercentileCurve,
  interpretPercentile,
} from '../percentileCalculator';
import { GrowthChartDataPoint } from '../../types';

describe('percentileCalculator', () => {
  const mockLMSData: GrowthChartDataPoint = {
    ageInMonths: 6,
    L: 0.3487,
    M: 7.934,
    S: 0.12619,
  };

  const mockChartData: GrowthChartDataPoint[] = [
    { ageInMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
    { ageInMonths: 6, L: 0.3487, M: 7.934, S: 0.12619 },
    { ageInMonths: 12, L: 0.1738, M: 9.6479, S: 0.11727 },
    { ageInMonths: 24, L: -0.0137, M: 12.1515, S: 0.11426 },
  ];

  describe('calculateZScore', () => {
    it('should calculate Z-score for typical value', () => {
      const zScore = calculateZScore(8.0, mockLMSData);

      // This should be close to 0 (50th percentile)
      expect(zScore).toBeCloseTo(0, 0);
    });

    it('should calculate positive Z-score for above-median value', () => {
      const zScore = calculateZScore(10.0, mockLMSData);

      expect(zScore).toBeGreaterThan(1);
    });

    it('should calculate negative Z-score for below-median value', () => {
      const zScore = calculateZScore(6.0, mockLMSData);

      expect(zScore).toBeLessThan(0);
    });

    it('should handle L=0 case (WHO data format)', () => {
      const lmsDataWithZeroL: GrowthChartDataPoint = {
        ageInMonths: 6,
        L: 0,
        M: 7.934,
        S: 0.12619,
      };

      const zScore = calculateZScore(8.0, lmsDataWithZeroL);

      expect(zScore).toBeDefined();
      expect(typeof zScore).toBe('number');
    });
  });

  describe('zScoreToPercentile', () => {
    it('should convert Z-score of 0 to 50th percentile', () => {
      const percentile = zScoreToPercentile(0);

      expect(percentile).toBeCloseTo(50, 0);
    });

    it('should convert positive Z-score to high percentile', () => {
      const percentile = zScoreToPercentile(1.645);

      // Z-score of 1.645 ≈ 95th percentile
      expect(percentile).toBeCloseTo(95, 0);
    });

    it('should convert negative Z-score to low percentile', () => {
      const percentile = zScoreToPercentile(-1.645);

      // Z-score of -1.645 ≈ 5th percentile
      expect(percentile).toBeCloseTo(5, 0);
    });

    it('should clamp percentile between 0 and 100', () => {
      const veryLowPercentile = zScoreToPercentile(-10);
      const veryHighPercentile = zScoreToPercentile(10);

      expect(veryLowPercentile).toBeGreaterThanOrEqual(0);
      expect(veryHighPercentile).toBeLessThanOrEqual(100);
    });
  });

  describe('zScoreToValue', () => {
    it('should convert Z-score back to value', () => {
      // Calculate Z-score for value 8.0
      const zScore = calculateZScore(8.0, mockLMSData);

      // Convert back to value
      const value = zScoreToValue(zScore, mockLMSData);

      expect(value).toBeCloseTo(8.0, 1);
    });

    it('should handle L=0 case', () => {
      const lmsDataWithZeroL: GrowthChartDataPoint = {
        ageInMonths: 6,
        L: 0,
        M: 7.934,
        S: 0.12619,
      };

      const value = zScoreToValue(0, lmsDataWithZeroL);

      // Z-score of 0 should give median value
      expect(value).toBeCloseTo(7.934, 1);
    });
  });

  describe('interpolateLMS', () => {
    it('should return exact match when age is in data', () => {
      const lms = interpolateLMS(6, mockChartData);

      expect(lms).not.toBeNull();
      expect(lms?.ageInMonths).toBe(6);
      expect(lms?.M).toBe(7.934);
    });

    it('should interpolate between two data points', () => {
      const lms = interpolateLMS(3, mockChartData);

      expect(lms).not.toBeNull();
      expect(lms?.ageInMonths).toBe(3);

      // Value should be between the two surrounding data points
      expect(lms?.M).toBeGreaterThan(3.3464); // 0 months
      expect(lms?.M).toBeLessThan(7.934);    // 6 months
    });

    it('should return first data point for age below range', () => {
      const lms = interpolateLMS(-1, mockChartData);

      expect(lms).not.toBeNull();
      expect(lms?.M).toBe(mockChartData[0].M);
    });

    it('should return last data point for age above range', () => {
      const lms = interpolateLMS(100, mockChartData);

      expect(lms).not.toBeNull();
      expect(lms?.M).toBe(mockChartData[mockChartData.length - 1].M);
    });

    it('should return null for empty data', () => {
      const lms = interpolateLMS(6, []);

      expect(lms).toBeNull();
    });
  });

  describe('calculatePercentile', () => {
    it('should calculate percentile data for a measurement', () => {
      const result = calculatePercentile(8.0, 6, mockChartData);

      expect(result).not.toBeNull();
      expect(result?.value).toBe(8.0);
      expect(result?.ageInMonths).toBe(6);
      expect(result?.percentile).toBeGreaterThan(40);
      expect(result?.percentile).toBeLessThan(60);
      expect(result?.zScore).toBeDefined();
    });

    it('should handle high percentile values', () => {
      const result = calculatePercentile(10.0, 6, mockChartData);

      expect(result).not.toBeNull();
      expect(result?.percentile).toBeGreaterThan(90);
    });

    it('should handle low percentile values', () => {
      const result = calculatePercentile(6.0, 6, mockChartData);

      expect(result).not.toBeNull();
      expect(result?.percentile).toBeLessThan(10);
    });

    it('should return null for empty chart data', () => {
      const result = calculatePercentile(8.0, 6, []);

      expect(result).toBeNull();
    });

    it('should interpolate for ages between data points', () => {
      const result = calculatePercentile(8.5, 9, mockChartData);

      expect(result).not.toBeNull();
      expect(result?.ageInMonths).toBe(9);
    });
  });

  describe('getPercentileCurve', () => {
    it('should generate 50th percentile curve', () => {
      const curve = getPercentileCurve(50, mockChartData);

      expect(curve).toHaveLength(mockChartData.length);

      // Each point should have age and value
      curve.forEach(point => {
        expect(point.ageInMonths).toBeDefined();
        expect(point.value).toBeDefined();
        expect(typeof point.value).toBe('number');
      });

      // 50th percentile values should be close to M values
      expect(curve[1].value).toBeCloseTo(mockChartData[1].M, 0);
    });

    it('should generate 95th percentile curve', () => {
      const curve = getPercentileCurve(95, mockChartData);

      expect(curve).toHaveLength(mockChartData.length);

      // 95th percentile should be higher than median
      expect(curve[1].value).toBeGreaterThan(mockChartData[1].M);
    });

    it('should generate 5th percentile curve', () => {
      const curve = getPercentileCurve(5, mockChartData);

      expect(curve).toHaveLength(mockChartData.length);

      // 5th percentile should be lower than median
      expect(curve[1].value).toBeLessThan(mockChartData[1].M);
    });

    it('should generate curves for all ages in data', () => {
      const curve = getPercentileCurve(50, mockChartData);

      const ages = curve.map(p => p.ageInMonths);
      const expectedAges = mockChartData.map(d => d.ageInMonths);

      expect(ages).toEqual(expectedAges);
    });
  });

  describe('interpretPercentile', () => {
    it('should interpret below 3rd percentile', () => {
      expect(interpretPercentile(1)).toBe('Below 3rd percentile');
      expect(interpretPercentile(2.5)).toBe('Below 3rd percentile');
    });

    it('should interpret 3rd to 5th percentile', () => {
      expect(interpretPercentile(3)).toBe('3rd to 5th percentile');
      expect(interpretPercentile(4)).toBe('3rd to 5th percentile');
    });

    it('should interpret 5th to 10th percentile', () => {
      expect(interpretPercentile(5)).toBe('5th to 10th percentile');
      expect(interpretPercentile(7)).toBe('5th to 10th percentile');
    });

    it('should interpret 10th to 25th percentile', () => {
      expect(interpretPercentile(10)).toBe('10th to 25th percentile');
      expect(interpretPercentile(20)).toBe('10th to 25th percentile');
    });

    it('should interpret 25th to 50th percentile', () => {
      expect(interpretPercentile(25)).toBe('25th to 50th percentile');
      expect(interpretPercentile(40)).toBe('25th to 50th percentile');
    });

    it('should interpret 50th to 75th percentile', () => {
      expect(interpretPercentile(50)).toBe('50th to 75th percentile');
      expect(interpretPercentile(60)).toBe('50th to 75th percentile');
    });

    it('should interpret 75th to 90th percentile', () => {
      expect(interpretPercentile(75)).toBe('75th to 90th percentile');
      expect(interpretPercentile(85)).toBe('75th to 90th percentile');
    });

    it('should interpret 90th to 95th percentile', () => {
      expect(interpretPercentile(90)).toBe('90th to 95th percentile');
      expect(interpretPercentile(93)).toBe('90th to 95th percentile');
    });

    it('should interpret 95th to 97th percentile', () => {
      expect(interpretPercentile(95)).toBe('95th to 97th percentile');
      expect(interpretPercentile(96)).toBe('95th to 97th percentile');
    });

    it('should interpret above 97th percentile', () => {
      expect(interpretPercentile(97)).toBe('Above 97th percentile');
      expect(interpretPercentile(99)).toBe('Above 97th percentile');
    });
  });
});
