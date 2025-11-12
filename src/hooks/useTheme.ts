/**
 * useTheme Hook
 * Detects system color scheme and returns appropriate theme colors
 */

import { useColorScheme } from 'react-native';
import { DarkColors, LightColors } from '../constants/colors';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? DarkColors : LightColors,
    isDark,
    colorScheme: colorScheme || 'light',
  };
};
