/**
 * CDC Growth Chart Data
 * Sample LMS (Lambda-Mu-Sigma) data for growth percentiles
 *
 * NOTE: This is a simplified sample dataset for demonstration.
 * For a production app, you should include the complete CDC growth chart data
 * from: https://www.cdc.gov/growthcharts/percentile_data_files.htm
 *
 * The full datasets include:
 * - Weight-for-age (0-36 months, 2-20 years)
 * - Length/Height-for-age (0-36 months, 2-20 years)
 * - Head circumference-for-age (0-36 months)
 * - Weight-for-length (45-103 cm)
 * - BMI-for-age (2-20 years)
 */

import { GrowthChartData } from '../types';

/**
 * Sample CDC Weight-for-Age Data (0-36 months)
 * Values are in kilograms
 */
const cdcWeightForAgeMale = [
  { ageInMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { ageInMonths: 1, L: 0.2297, M: 4.4709, S: 0.13395 },
  { ageInMonths: 2, L: 0.1970, M: 5.5675, S: 0.12385 },
  { ageInMonths: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { ageInMonths: 6, L: 0.0996, M: 7.9340, S: 0.11073 },
  { ageInMonths: 9, L: 0.0500, M: 9.1800, S: 0.10768 },
  { ageInMonths: 12, L: 0.0095, M: 10.1726, S: 0.10698 },
  { ageInMonths: 15, L: -0.0278, M: 11.0162, S: 0.10825 },
  { ageInMonths: 18, L: -0.0626, M: 11.7471, S: 0.11020 },
  { ageInMonths: 24, L: -0.1285, M: 12.9359, S: 0.11499 },
  { ageInMonths: 30, L: -0.1893, M: 13.9876, S: 0.12028 },
  { ageInMonths: 36, L: -0.2463, M: 14.9354, S: 0.12555 },
];

const cdcWeightForAgeFemale = [
  { ageInMonths: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { ageInMonths: 1, L: 0.1714, M: 4.1873, S: 0.13724 },
  { ageInMonths: 2, L: 0.0962, M: 5.1282, S: 0.13000 },
  { ageInMonths: 3, L: 0.0402, M: 5.8458, S: 0.12619 },
  { ageInMonths: 6, L: -0.0881, M: 7.2100, S: 0.12247 },
  { ageInMonths: 9, L: -0.1958, M: 8.4950, S: 0.12176 },
  { ageInMonths: 12, L: -0.2915, M: 9.5300, S: 0.12274 },
  { ageInMonths: 15, L: -0.3788, M: 10.3977, S: 0.12456 },
  { ageInMonths: 18, L: -0.4600, M: 11.1727, S: 0.12664 },
  { ageInMonths: 24, L: -0.6142, M: 12.4588, S: 0.13165 },
  { ageInMonths: 30, L: -0.7537, M: 13.5803, S: 0.13697 },
  { ageInMonths: 36, L: -0.8809, M: 14.5875, S: 0.14219 },
];

/**
 * Sample CDC Length/Height-for-Age Data (0-36 months)
 * Values are in centimeters
 */
const cdcHeightForAgeMale = [
  { ageInMonths: 0, L: 1, M: 49.8842, S: 0.0379 },
  { ageInMonths: 1, L: 1, M: 54.7244, S: 0.0364 },
  { ageInMonths: 2, L: 1, M: 58.4249, S: 0.0352 },
  { ageInMonths: 3, L: 1, M: 61.4292, S: 0.0342 },
  { ageInMonths: 6, L: 1, M: 67.6236, S: 0.0321 },
  { ageInMonths: 9, L: 1, M: 72.5881, S: 0.0307 },
  { ageInMonths: 12, L: 1, M: 76.1027, S: 0.0299 },
  { ageInMonths: 15, L: 1, M: 79.1746, S: 0.0295 },
  { ageInMonths: 18, L: 1, M: 82.0033, S: 0.0292 },
  { ageInMonths: 24, L: 1, M: 86.7756, S: 0.0289 },
  { ageInMonths: 30, L: 1, M: 91.0931, S: 0.0289 },
  { ageInMonths: 36, L: 1, M: 95.1443, S: 0.0289 },
];

const cdcHeightForAgeFemale = [
  { ageInMonths: 0, L: 1, M: 49.1477, S: 0.0379 },
  { ageInMonths: 1, L: 1, M: 53.6872, S: 0.0364 },
  { ageInMonths: 2, L: 1, M: 57.0673, S: 0.0352 },
  { ageInMonths: 3, L: 1, M: 59.8029, S: 0.0343 },
  { ageInMonths: 6, L: 1, M: 65.7311, S: 0.0322 },
  { ageInMonths: 9, L: 1, M: 70.4011, S: 0.0309 },
  { ageInMonths: 12, L: 1, M: 74.3976, S: 0.0303 },
  { ageInMonths: 15, L: 1, M: 77.5365, S: 0.0299 },
  { ageInMonths: 18, L: 1, M: 80.3524, S: 0.0297 },
  { ageInMonths: 24, L: 1, M: 85.0829, S: 0.0295 },
  { ageInMonths: 30, L: 1, M: 89.3649, S: 0.0295 },
  { ageInMonths: 36, L: 1, M: 93.4432, S: 0.0296 },
];

/**
 * Sample CDC Head Circumference-for-Age Data (0-36 months)
 * Values are in centimeters
 */
const cdcHeadCircumferenceMale = [
  { ageInMonths: 0, L: 1, M: 34.4618, S: 0.03686 },
  { ageInMonths: 1, L: 1, M: 37.2759, S: 0.03251 },
  { ageInMonths: 2, L: 1, M: 39.1285, S: 0.03048 },
  { ageInMonths: 3, L: 1, M: 40.5135, S: 0.02958 },
  { ageInMonths: 6, L: 1, M: 43.3074, S: 0.02881 },
  { ageInMonths: 9, L: 1, M: 45.2294, S: 0.02881 },
  { ageInMonths: 12, L: 1, M: 46.5733, S: 0.02914 },
  { ageInMonths: 15, L: 1, M: 47.6018, S: 0.02965 },
  { ageInMonths: 18, L: 1, M: 48.4243, S: 0.03020 },
  { ageInMonths: 24, L: 1, M: 49.6209, S: 0.03137 },
  { ageInMonths: 30, L: 1, M: 50.5199, S: 0.03250 },
  { ageInMonths: 36, L: 1, M: 51.2233, S: 0.03354 },
];

const cdcHeadCircumferenceFemale = [
  { ageInMonths: 0, L: 1, M: 33.8787, S: 0.03496 },
  { ageInMonths: 1, L: 1, M: 36.5318, S: 0.03166 },
  { ageInMonths: 2, L: 1, M: 38.2609, S: 0.03000 },
  { ageInMonths: 3, L: 1, M: 39.5328, S: 0.02935 },
  { ageInMonths: 6, L: 1, M: 42.1968, S: 0.02881 },
  { ageInMonths: 9, L: 1, M: 44.0606, S: 0.02881 },
  { ageInMonths: 12, L: 1, M: 45.3682, S: 0.02914 },
  { ageInMonths: 15, L: 1, M: 46.3746, S: 0.02965 },
  { ageInMonths: 18, L: 1, M: 47.1710, S: 0.03020 },
  { ageInMonths: 24, L: 1, M: 48.3242, S: 0.03137 },
  { ageInMonths: 30, L: 1, M: 49.1776, S: 0.03250 },
  { ageInMonths: 36, L: 1, M: 49.8432, S: 0.03354 },
];

/**
 * CDC Growth Chart Data organized by measurement type and sex
 */
export const cdcGrowthCharts: GrowthChartData = {
  weight: {
    male: cdcWeightForAgeMale,
    female: cdcWeightForAgeFemale,
  },
  height: {
    male: cdcHeightForAgeMale,
    female: cdcHeightForAgeFemale,
  },
  headCircumference: {
    male: cdcHeadCircumferenceMale,
    female: cdcHeadCircumferenceFemale,
  },
};

/**
 * Get growth chart data for specific measurement type and sex
 */
export const getCDCChartData = (
  measurementType: string,
  sex: string
) => {
  return cdcGrowthCharts[measurementType]?.[sex] || [];
};
