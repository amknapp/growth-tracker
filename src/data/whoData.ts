/**
 * WHO Growth Chart Data
 * Sample LMS (Lambda-Mu-Sigma) data for growth percentiles
 *
 * NOTE: This is a simplified sample dataset for demonstration.
 * For a production app, you should include the complete WHO growth standards data
 * from: https://www.who.int/tools/child-growth-standards/standards
 *
 * WHO standards cover:
 * - Weight-for-age (0-5 years)
 * - Length/Height-for-age (0-5 years)
 * - Weight-for-length/height (0-5 years)
 * - BMI-for-age (0-5 years)
 * - Head circumference-for-age (0-5 years)
 */

import { GrowthChartData } from '../types';

/**
 * Sample WHO Weight-for-Age Data (0-24 months)
 * Values are in kilograms
 */
const whoWeightForAgeMale = [
  { ageInMonths: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { ageInMonths: 1, L: 0.2917, M: 4.4881, S: 0.13098 },
  { ageInMonths: 2, L: 0.2581, M: 5.5675, S: 0.12385 },
  { ageInMonths: 3, L: 0.2351, M: 6.3762, S: 0.11862 },
  { ageInMonths: 6, L: 0.1738, M: 7.9340, S: 0.11194 },
  { ageInMonths: 9, L: 0.1288, M: 9.1800, S: 0.10960 },
  { ageInMonths: 12, L: 0.0913, M: 10.1726, S: 0.10980 },
  { ageInMonths: 15, L: 0.0581, M: 11.0162, S: 0.11141 },
  { ageInMonths: 18, L: 0.0276, M: 11.7471, S: 0.11372 },
  { ageInMonths: 24, L: -0.0283, M: 12.9359, S: 0.11888 },
];

const whoWeightForAgeFemale = [
  { ageInMonths: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { ageInMonths: 1, L: 0.3317, M: 4.1873, S: 0.13373 },
  { ageInMonths: 2, L: 0.2994, M: 5.1282, S: 0.12619 },
  { ageInMonths: 3, L: 0.2752, M: 5.8458, S: 0.11977 },
  { ageInMonths: 6, L: 0.2153, M: 7.2100, S: 0.11080 },
  { ageInMonths: 9, L: 0.1714, M: 8.4950, S: 0.10815 },
  { ageInMonths: 12, L: 0.1349, M: 9.5300, S: 0.10842 },
  { ageInMonths: 15, L: 0.1034, M: 10.3977, S: 0.11025 },
  { ageInMonths: 18, L: 0.0755, M: 11.1727, S: 0.11280 },
  { ageInMonths: 24, L: 0.0269, M: 12.4588, S: 0.11847 },
];

/**
 * Sample WHO Length/Height-for-Age Data (0-24 months)
 * Values are in centimeters
 */
const whoHeightForAgeMale = [
  { ageInMonths: 0, L: 1, M: 49.8842, S: 0.03795 },
  { ageInMonths: 1, L: 1, M: 54.7244, S: 0.03557 },
  { ageInMonths: 2, L: 1, M: 58.4249, S: 0.03424 },
  { ageInMonths: 3, L: 1, M: 61.4292, S: 0.03328 },
  { ageInMonths: 6, L: 1, M: 67.6236, S: 0.03138 },
  { ageInMonths: 9, L: 1, M: 72.0328, S: 0.03004 },
  { ageInMonths: 12, L: 1, M: 75.7488, S: 0.02915 },
  { ageInMonths: 15, L: 1, M: 79.1746, S: 0.02862 },
  { ageInMonths: 18, L: 1, M: 82.0033, S: 0.02831 },
  { ageInMonths: 24, L: 1, M: 86.7756, S: 0.02824 },
];

const whoHeightForAgeFemale = [
  { ageInMonths: 0, L: 1, M: 49.1477, S: 0.03790 },
  { ageInMonths: 1, L: 1, M: 53.6872, S: 0.03568 },
  { ageInMonths: 2, L: 1, M: 57.0673, S: 0.03441 },
  { ageInMonths: 3, L: 1, M: 59.8029, S: 0.03348 },
  { ageInMonths: 6, L: 1, M: 65.7311, S: 0.03155 },
  { ageInMonths: 9, L: 1, M: 70.1403, S: 0.03021 },
  { ageInMonths: 12, L: 1, M: 73.8736, S: 0.02934 },
  { ageInMonths: 15, L: 1, M: 77.3186, S: 0.02883 },
  { ageInMonths: 18, L: 1, M: 80.1593, S: 0.02854 },
  { ageInMonths: 24, L: 1, M: 84.9474, S: 0.02849 },
];

/**
 * Sample WHO Head Circumference-for-Age Data (0-24 months)
 * Values are in centimeters
 */
const whoHeadCircumferenceMale = [
  { ageInMonths: 0, L: 0.1, M: 34.4618, S: 0.03686 },
  { ageInMonths: 1, L: 0.1, M: 37.2759, S: 0.03251 },
  { ageInMonths: 2, L: 0.1, M: 39.1285, S: 0.03048 },
  { ageInMonths: 3, L: 0.1, M: 40.5135, S: 0.02958 },
  { ageInMonths: 6, L: 0.1, M: 43.3074, S: 0.02881 },
  { ageInMonths: 9, L: 0.1, M: 45.2294, S: 0.02881 },
  { ageInMonths: 12, L: 0.1, M: 46.5733, S: 0.02914 },
  { ageInMonths: 15, L: 0.1, M: 47.6018, S: 0.02965 },
  { ageInMonths: 18, L: 0.1, M: 48.4243, S: 0.03020 },
  { ageInMonths: 24, L: 0.1, M: 49.6209, S: 0.03137 },
];

const whoHeadCircumferenceFemale = [
  { ageInMonths: 0, L: 0.1, M: 33.8787, S: 0.03496 },
  { ageInMonths: 1, L: 0.1, M: 36.5318, S: 0.03166 },
  { ageInMonths: 2, L: 0.1, M: 38.2609, S: 0.03000 },
  { ageInMonths: 3, L: 0.1, M: 39.5328, S: 0.02935 },
  { ageInMonths: 6, L: 0.1, M: 42.1968, S: 0.02881 },
  { ageInMonths: 9, L: 0.1, M: 44.0606, S: 0.02881 },
  { ageInMonths: 12, L: 0.1, M: 45.3682, S: 0.02914 },
  { ageInMonths: 15, L: 0.1, M: 46.3746, S: 0.02965 },
  { ageInMonths: 18, L: 0.1, M: 47.1710, S: 0.03020 },
  { ageInMonths: 24, L: 0.1, M: 48.3242, S: 0.03137 },
];

/**
 * WHO Growth Chart Data organized by measurement type and sex
 */
export const whoGrowthCharts: GrowthChartData = {
  weight: {
    male: whoWeightForAgeMale,
    female: whoWeightForAgeFemale,
  },
  height: {
    male: whoHeightForAgeMale,
    female: whoHeightForAgeFemale,
  },
  headCircumference: {
    male: whoHeadCircumferenceMale,
    female: whoHeadCircumferenceFemale,
  },
};

/**
 * Get WHO growth chart data for specific measurement type and sex
 */
export const getWHOChartData = (
  measurementType: string,
  sex: string
) => {
  return whoGrowthCharts[measurementType]?.[sex] || [];
};
