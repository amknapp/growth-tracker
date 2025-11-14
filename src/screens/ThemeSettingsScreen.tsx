import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { getThemeColors, ThemeInfo, ThemeName } from '../constants/colors';
import AppHeader from '../components/AppHeader';

const THEME_OPTIONS: ThemeName[] = ['purple', 'blue', 'green', 'coral', 'teal'];

export default function ThemeSettingsScreen() {
  const { colors, themeName, setThemeName, isDark } = useTheme();

  const handleThemeSelect = async (theme: ThemeName) => {
    await setThemeName(theme);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Theme Settings" />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Choose Your Color Theme
          </Text>
          <Text
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            Select a color theme that suits your style. The theme will adapt to
            your device's light/dark mode setting.
          </Text>
        </View>

        <View style={styles.themesContainer}>
          {THEME_OPTIONS.map(theme => {
            const isSelected = themeName === theme;
            const themeColors = getThemeColors(theme, isDark);
            const info = ThemeInfo[theme];

            return (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 3 : 1,
                  },
                ]}
                onPress={() => handleThemeSelect(theme)}
                activeOpacity={0.7}
              >
                <View style={styles.themeCardContent}>
                  <View style={styles.colorPreview}>
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: themeColors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorCircleSmall,
                        { backgroundColor: themeColors.primaryLight },
                      ]}
                    />
                    <View
                      style={[
                        styles.colorCircleSmall,
                        { backgroundColor: themeColors.primaryDark },
                      ]}
                    />
                  </View>

                  <View style={styles.themeInfo}>
                    <Text
                      style={[
                        styles.themeName,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {info.name}
                    </Text>
                    <Text
                      style={[
                        styles.themeDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {info.description}
                    </Text>
                  </View>

                  {isSelected && (
                    <View
                      style={[
                        styles.selectedBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your theme preference is saved locally and will persist across app
            restarts. The colors automatically adapt to your device's light or
            dark mode setting.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  themesContainer: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  themeCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  themeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  colorCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  themeInfo: {
    flex: 1,
    gap: 4,
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeDescription: {
    fontSize: 14,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    margin: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
