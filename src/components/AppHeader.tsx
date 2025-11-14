/**
 * App Header Component
 * Reusable header with menu button and title
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  subtitle2?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  subtitle2,
}) => {
  const { colors } = useTheme();
  const drawerNavigation = useNavigation();
  const insets = useSafeAreaInsets();

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  const styles = getStyles(colors, insets.top);

  return (
    <View
      style={styles.header}
      testID="app-header"
      accessibilityLabel={title}
      accessibilityRole="header"
    >
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          accessibilityLabel="Open navigation menu"
          accessibilityRole="button"
          accessibilityHint="Opens the navigation drawer"
          testID="menu-button"
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        </View>
      </View>
      {subtitle && (
        <Text style={styles.subtitle} accessibilityRole="text">
          {subtitle}
        </Text>
      )}
      {subtitle2 && (
        <Text style={styles.subtitle2} accessibilityRole="text">
          {subtitle2}
        </Text>
      )}
    </View>
  );
};

const getStyles = (
  colors: typeof import('../constants/colors').LightColors,
  topInset: number,
) =>
  StyleSheet.create({
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: Math.max(topInset + 20, 60), // Use safe area inset + padding, with minimum of 60
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuButton: {
      marginRight: 16,
      padding: 4,
    },
    menuIcon: {
      fontSize: 28,
      color: '#fff',
      fontWeight: 'bold',
    },
    headerTitleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
    },
    subtitle: {
      fontSize: 16,
      color: '#fff',
      marginTop: 8,
      opacity: 0.9,
    },
    subtitle2: {
      fontSize: 14,
      color: '#fff',
      marginTop: 4,
      opacity: 0.9,
    },
  });

export default AppHeader;
