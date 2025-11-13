/**
 * App Color Palette
 * Multiple theme options with light and dark mode support
 */

export type ThemeName = 'purple' | 'blue' | 'green' | 'coral' | 'teal';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  chartGrid: string;
  chartPercentile: string;
  chartPercentileMain: string;
  chartChildData: string;
}

// Purple Theme (Original)
const PurpleLightColors: ColorPalette = {
  primary: '#7E57C2',
  primaryLight: '#B39DDB',
  primaryDark: '#5E35B1',

  // UI Colors
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textLight: '#999',
  border: '#e0e0e0',

  // Status Colors
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#FF3B30',

  // Chart Colors
  chartGrid: '#e0e0e0',
  chartPercentile: 'rgba(150, 150, 150, 0.4)',
  chartPercentileMain: 'rgba(150, 150, 150, 0.7)',
  chartChildData: '#7E57C2',
};

const PurpleDarkColors: ColorPalette = {
  primary: '#B39DDB',
  primaryLight: '#D1C4E9',
  primaryDark: '#9575CD',

  // UI Colors
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  border: '#333333',

  // Status Colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF5350',

  // Chart Colors
  chartGrid: '#333333',
  chartPercentile: 'rgba(180, 180, 180, 0.4)',
  chartPercentileMain: 'rgba(180, 180, 180, 0.7)',
  chartChildData: '#B39DDB',
};

// Blue Theme - Calm and trustworthy
const BlueLightColors: ColorPalette = {
  primary: '#1976D2',
  primaryLight: '#64B5F6',
  primaryDark: '#0D47A1',

  // UI Colors
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textLight: '#999',
  border: '#e0e0e0',

  // Status Colors
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#FF3B30',

  // Chart Colors
  chartGrid: '#e0e0e0',
  chartPercentile: 'rgba(150, 150, 150, 0.4)',
  chartPercentileMain: 'rgba(150, 150, 150, 0.7)',
  chartChildData: '#1976D2',
};

const BlueDarkColors: ColorPalette = {
  primary: '#64B5F6',
  primaryLight: '#90CAF9',
  primaryDark: '#42A5F5',

  // UI Colors
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  border: '#333333',

  // Status Colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF5350',

  // Chart Colors
  chartGrid: '#333333',
  chartPercentile: 'rgba(180, 180, 180, 0.4)',
  chartPercentileMain: 'rgba(180, 180, 180, 0.7)',
  chartChildData: '#64B5F6',
};

// Green Theme - Fresh and natural
const GreenLightColors: ColorPalette = {
  primary: '#43A047',
  primaryLight: '#81C784',
  primaryDark: '#2E7D32',

  // UI Colors
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textLight: '#999',
  border: '#e0e0e0',

  // Status Colors
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#FF3B30',

  // Chart Colors
  chartGrid: '#e0e0e0',
  chartPercentile: 'rgba(150, 150, 150, 0.4)',
  chartPercentileMain: 'rgba(150, 150, 150, 0.7)',
  chartChildData: '#43A047',
};

const GreenDarkColors: ColorPalette = {
  primary: '#81C784',
  primaryLight: '#A5D6A7',
  primaryDark: '#66BB6A',

  // UI Colors
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  border: '#333333',

  // Status Colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF5350',

  // Chart Colors
  chartGrid: '#333333',
  chartPercentile: 'rgba(180, 180, 180, 0.4)',
  chartPercentileMain: 'rgba(180, 180, 180, 0.7)',
  chartChildData: '#81C784',
};

// Coral Theme - Warm and friendly
const CoralLightColors: ColorPalette = {
  primary: '#FF6F61',
  primaryLight: '#FF9E8A',
  primaryDark: '#E85D4F',

  // UI Colors
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textLight: '#999',
  border: '#e0e0e0',

  // Status Colors
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#FF3B30',

  // Chart Colors
  chartGrid: '#e0e0e0',
  chartPercentile: 'rgba(150, 150, 150, 0.4)',
  chartPercentileMain: 'rgba(150, 150, 150, 0.7)',
  chartChildData: '#FF6F61',
};

const CoralDarkColors: ColorPalette = {
  primary: '#FF9E8A',
  primaryLight: '#FFBFB0',
  primaryDark: '#FF8A7A',

  // UI Colors
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  border: '#333333',

  // Status Colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF5350',

  // Chart Colors
  chartGrid: '#333333',
  chartPercentile: 'rgba(180, 180, 180, 0.4)',
  chartPercentileMain: 'rgba(180, 180, 180, 0.7)',
  chartChildData: '#FF9E8A',
};

// Teal Theme - Modern and balanced
const TealLightColors: ColorPalette = {
  primary: '#00897B',
  primaryLight: '#4DB6AC',
  primaryDark: '#00695C',

  // UI Colors
  background: '#f5f5f5',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textLight: '#999',
  border: '#e0e0e0',

  // Status Colors
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#FF3B30',

  // Chart Colors
  chartGrid: '#e0e0e0',
  chartPercentile: 'rgba(150, 150, 150, 0.4)',
  chartPercentileMain: 'rgba(150, 150, 150, 0.7)',
  chartChildData: '#00897B',
};

const TealDarkColors: ColorPalette = {
  primary: '#4DB6AC',
  primaryLight: '#80CBC4',
  primaryDark: '#26A69A',

  // UI Colors
  background: '#121212',
  card: '#1E1E1E',
  text: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  border: '#333333',

  // Status Colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#EF5350',

  // Chart Colors
  chartGrid: '#333333',
  chartPercentile: 'rgba(180, 180, 180, 0.4)',
  chartPercentileMain: 'rgba(180, 180, 180, 0.7)',
  chartChildData: '#4DB6AC',
};

// Theme Collections
export const LightThemes = {
  purple: PurpleLightColors,
  blue: BlueLightColors,
  green: GreenLightColors,
  coral: CoralLightColors,
  teal: TealLightColors,
};

export const DarkThemes = {
  purple: PurpleDarkColors,
  blue: BlueDarkColors,
  green: GreenDarkColors,
  coral: CoralDarkColors,
  teal: TealDarkColors,
};

// Theme metadata for UI display
export const ThemeInfo: Record<
  ThemeName,
  { name: string; description: string }
> = {
  purple: { name: 'Purple', description: 'Playful and modern' },
  blue: { name: 'Blue', description: 'Calm and trustworthy' },
  green: { name: 'Green', description: 'Fresh and natural' },
  coral: { name: 'Coral', description: 'Warm and friendly' },
  teal: { name: 'Teal', description: 'Modern and balanced' },
};

// Helper function to get theme colors
export const getThemeColors = (
  themeName: ThemeName,
  isDark: boolean,
): ColorPalette => {
  return isDark ? DarkThemes[themeName] : LightThemes[themeName];
};

// Legacy exports for backward compatibility
export const LightColors = PurpleLightColors;
export const DarkColors = PurpleDarkColors;
export const Colors = LightColors;
