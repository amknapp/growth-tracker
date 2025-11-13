import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette, getThemeColors, ThemeName } from '../constants/colors';

const THEME_STORAGE_KEY = '@GrowthTracker:userTheme';

interface ThemeContextType {
  colors: ColorPalette;
  themeName: ThemeName;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
  setThemeName: (theme: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeNameState] = useState<ThemeName>('purple');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          savedTheme &&
          ['purple', 'blue', 'green', 'coral', 'teal'].includes(savedTheme)
        ) {
          setThemeNameState(savedTheme as ThemeName);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setThemeName = async (theme: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setThemeNameState(theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const isDark = systemColorScheme === 'dark';
  const colorScheme = systemColorScheme || 'light';
  const colors = getThemeColors(themeName, isDark);

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeName,
        isDark,
        colorScheme,
        setThemeName,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
