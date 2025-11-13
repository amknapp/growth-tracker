/**
 * useTheme Hook
 * Now uses ThemeContext to support user-selected color themes
 * Maintains backward compatibility with existing code
 */

import { useThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  return useThemeContext();
};
