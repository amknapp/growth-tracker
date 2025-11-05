/**
 * Age Calculation Utilities
 * Calculates age in various formats based on birthdate
 */

import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { AgeCalculation } from '../types';

/**
 * Calculate age in months with decimal precision
 * Used for accurate percentile calculations
 */
export const calculateAgeInMonths = (
  birthDate: string | Date,
  measurementDate: string | Date = new Date()
): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const measurement = typeof measurementDate === 'string' ? new Date(measurementDate) : measurementDate;

  const days = differenceInDays(measurement, birth);
  // Convert days to months (approximate: 365.25 days/year ÷ 12 months/year = 30.4375 days/month)
  return days / 30.4375;
};

/**
 * Calculate age breakdown (years, months, total months, total days)
 */
export const calculateAge = (
  birthDate: string | Date,
  measurementDate: string | Date = new Date()
): AgeCalculation => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const measurement = typeof measurementDate === 'string' ? new Date(measurementDate) : measurementDate;

  const totalYears = differenceInYears(measurement, birth);
  const totalMonths = differenceInMonths(measurement, birth);
  const totalDays = differenceInDays(measurement, birth);

  // Calculate remaining months after full years
  const remainingMonths = totalMonths % 12;

  return {
    years: totalYears,
    months: remainingMonths,
    totalMonths,
    totalDays,
  };
};

/**
 * Format age as a readable string
 * Examples: "2 years, 3 months", "6 months", "3 years"
 */
export const formatAge = (age: AgeCalculation): string => {
  if (age.years === 0) {
    return `${age.months} ${age.months === 1 ? 'month' : 'months'}`;
  }

  if (age.months === 0) {
    return `${age.years} ${age.years === 1 ? 'year' : 'years'}`;
  }

  return `${age.years} ${age.years === 1 ? 'year' : 'years'}, ${age.months} ${
    age.months === 1 ? 'month' : 'months'
  }`;
};

/**
 * Calculate age at measurement date from birthdate
 */
export const getAgeAtMeasurement = (
  birthDate: string,
  measurementDate: string
): AgeCalculation => {
  return calculateAge(birthDate, measurementDate);
};

/**
 * Get current age
 */
export const getCurrentAge = (birthDate: string): AgeCalculation => {
  return calculateAge(birthDate, new Date());
};

/**
 * Determine if child is in the valid age range for growth charts
 * CDC: 0-20 years
 * WHO: 0-5 years (for some measurements)
 */
export const isValidAgeForChart = (
  ageInMonths: number,
  chartType: 'CDC' | 'WHO' = 'CDC'
): boolean => {
  if (chartType === 'CDC') {
    return ageInMonths >= 0 && ageInMonths <= 240; // 0-20 years
  } else {
    // WHO charts typically cover 0-5 years (60 months)
    return ageInMonths >= 0 && ageInMonths <= 60;
  }
};
