/**
 * Growth Tracker Types
 * Defines the data models for the application
 */

export type Sex = 'male' | 'female';

export type MeasurementType = 'weight' | 'height' | 'headCircumference';

export type ChartStandard = 'CDC' | 'WHO';

/**
 * Child profile
 */
export interface Child {
  id: string;
  name: string;
  birthDate: string; // ISO 8601 date string
  sex: Sex;
  avatarUri?: string; // Optional custom avatar image URI
  createdAt: string;
  updatedAt: string;
}

/**
 * Growth measurement data point
 */
export interface Measurement {
  id: string;
  childId: string;
  date: string; // ISO 8601 date string
  type: MeasurementType;
  value: number; // in kg for weight, cm for height/head circumference
  notes?: string;
  createdAt: string;
}

/**
 * Calculated percentile data
 */
export interface PercentileData {
  value: number;
  percentile: number;
  zScore: number;
  ageInMonths: number;
}

/**
 * Growth chart reference data point
 */
export interface GrowthChartDataPoint {
  ageInMonths: number;
  L: number; // Lambda (skewness)
  M: number; // Mu (median)
  S: number; // Sigma (coefficient of variation)
}

/**
 * Growth chart data organized by type and sex
 */
export interface GrowthChartData {
  [key: string]: {
    // measurement type
    [key: string]: GrowthChartDataPoint[]; // sex
  };
}

/**
 * Application state
 */
export interface AppData {
  children: Child[];
  measurements: Measurement[];
  hasSeenOnboarding?: boolean;
}

/**
 * Age breakdown
 */
export interface AgeCalculation {
  years: number;
  months: number;
  totalMonths: number;
  totalDays: number;
}
