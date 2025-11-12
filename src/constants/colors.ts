/**
 * App Color Palette
 * Soft Purple theme - playful and modern
 * Supports both light and dark modes
 */

export const LightColors = {
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
  chartPercentileMain: 'rgba(150, 150, 150, 0.7)', // 50th percentile
  chartChildData: '#7E57C2', // Primary purple for child's data
};

export const DarkColors = {
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
  chartPercentileMain: 'rgba(180, 180, 180, 0.7)', // 50th percentile
  chartChildData: '#B39DDB', // Primary purple for child's data
};

// Legacy export for backward compatibility
export const Colors = LightColors;
