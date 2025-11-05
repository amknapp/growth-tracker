/**
 * Percentile Calculator
 * Calculates growth percentiles using the LMS method
 * (Lambda-Mu-Sigma method used by CDC and WHO)
 */

import { GrowthChartDataPoint, PercentileData } from '../types';

/**
 * Standard normal cumulative distribution function
 * Approximation using the error function
 */
const normalCDF = (z: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

  return z > 0 ? 1 - p : p;
};

/**
 * Calculate Z-score from percentile
 */
const percentileToZScore = (percentile: number): number => {
  // Use approximation for inverse normal CDF
  // This is a simplified version - for production, consider using a proper stats library
  if (percentile <= 0 || percentile >= 100) {
    throw new Error('Percentile must be between 0 and 100');
  }

  const p = percentile / 100;

  // Rational approximation for inverse normal CDF
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  let t: number;
  let z: number;

  if (p < 0.5) {
    t = Math.sqrt(-2 * Math.log(p));
    z = -(t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t));
  } else {
    t = Math.sqrt(-2 * Math.log(1 - p));
    z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
  }

  return z;
};

/**
 * Calculate Z-score using LMS method
 * Formula: Z = ((value/M)^L - 1) / (L * S)
 * Special case when L = 0: Z = ln(value/M) / S
 */
export const calculateZScore = (
  value: number,
  lmsData: GrowthChartDataPoint
): number => {
  const { L, M, S } = lmsData;

  if (L === 0) {
    return Math.log(value / M) / S;
  }

  return (Math.pow(value / M, L) - 1) / (L * S);
};

/**
 * Calculate percentile from Z-score
 */
export const zScoreToPercentile = (zScore: number): number => {
  const percentile = normalCDF(zScore) * 100;
  return Math.max(0, Math.min(100, percentile)); // Clamp between 0 and 100
};

/**
 * Calculate value from Z-score using LMS parameters
 * Inverse of calculateZScore
 */
export const zScoreToValue = (
  zScore: number,
  lmsData: GrowthChartDataPoint
): number => {
  const { L, M, S } = lmsData;

  if (L === 0) {
    return M * Math.exp(S * zScore);
  }

  return M * Math.pow(1 + L * S * zScore, 1 / L);
};

/**
 * Interpolate LMS values for a specific age
 * Uses linear interpolation between two data points
 */
export const interpolateLMS = (
  ageInMonths: number,
  data: GrowthChartDataPoint[]
): GrowthChartDataPoint | null => {
  if (data.length === 0) {
    return null;
  }

  // Find the two closest data points
  let lowerIndex = -1;
  let upperIndex = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i].ageInMonths <= ageInMonths) {
      lowerIndex = i;
    }
    if (data[i].ageInMonths >= ageInMonths && upperIndex === -1) {
      upperIndex = i;
    }
  }

  // Exact match
  if (lowerIndex !== -1 && data[lowerIndex].ageInMonths === ageInMonths) {
    return data[lowerIndex];
  }

  // Out of range (too young)
  if (lowerIndex === -1) {
    return data[0];
  }

  // Out of range (too old)
  if (upperIndex === -1) {
    return data[data.length - 1];
  }

  // Interpolate between two points
  const lower = data[lowerIndex];
  const upper = data[upperIndex];

  const ratio =
    (ageInMonths - lower.ageInMonths) /
    (upper.ageInMonths - lower.ageInMonths);

  return {
    ageInMonths,
    L: lower.L + (upper.L - lower.L) * ratio,
    M: lower.M + (upper.M - lower.M) * ratio,
    S: lower.S + (upper.S - lower.S) * ratio,
  };
};

/**
 * Calculate percentile data for a measurement
 */
export const calculatePercentile = (
  value: number,
  ageInMonths: number,
  chartData: GrowthChartDataPoint[]
): PercentileData | null => {
  const lmsData = interpolateLMS(ageInMonths, chartData);

  if (!lmsData) {
    return null;
  }

  const zScore = calculateZScore(value, lmsData);
  const percentile = zScoreToPercentile(zScore);

  return {
    value,
    percentile,
    zScore,
    ageInMonths,
  };
};

/**
 * Get percentile curve data for charting
 * Returns values for a specific percentile across age range
 */
export const getPercentileCurve = (
  percentile: number,
  chartData: GrowthChartDataPoint[]
): Array<{ ageInMonths: number; value: number }> => {
  const zScore = percentileToZScore(percentile);

  return chartData.map(lmsData => ({
    ageInMonths: lmsData.ageInMonths,
    value: zScoreToValue(zScore, lmsData),
  }));
};

/**
 * Standard percentiles to display on charts
 */
export const STANDARD_PERCENTILES = [3, 5, 10, 25, 50, 75, 90, 95, 97];

/**
 * Interpret percentile for user-friendly display
 */
export const interpretPercentile = (percentile: number): string => {
  if (percentile < 3) {
    return 'Below 3rd percentile';
  } else if (percentile < 5) {
    return '3rd to 5th percentile';
  } else if (percentile < 10) {
    return '5th to 10th percentile';
  } else if (percentile < 25) {
    return '10th to 25th percentile';
  } else if (percentile < 50) {
    return '25th to 50th percentile';
  } else if (percentile < 75) {
    return '50th to 75th percentile';
  } else if (percentile < 90) {
    return '75th to 90th percentile';
  } else if (percentile < 95) {
    return '90th to 95th percentile';
  } else if (percentile < 97) {
    return '95th to 97th percentile';
  } else {
    return 'Above 97th percentile';
  }
};
