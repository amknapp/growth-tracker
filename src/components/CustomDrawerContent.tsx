/**
 * Custom Drawer Content
 * Shows children list for quick switching and app navigation
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatAge, getCurrentAge } from '../utils/ageCalculator';
import { useTheme } from '../hooks/useTheme';
import { useChildren } from '../hooks/useChildren';
import { Child } from '../types';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = props => {
  const { children, loading } = useChildren();
  const navigation = useNavigation();
  const { colors } = useTheme();

  // No need to reload on navigation changes - Zustand store updates automatically

  const handleChildPress = (childId: string) => {
    // Navigate to the child's profile within the HomeStack
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeStack',
        params: {
          screen: 'ChildProfile',
          params: { childId },
        },
      }),
    );
    props.navigation.closeDrawer();
  };

  const handleHomePress = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeStack',
        params: {
          screen: 'Home',
        },
      }),
    );
    props.navigation.closeDrawer();
  };

  const handlePrivacyPress = () => {
    props.navigation.navigate('PrivacyPolicy');
  };

  const handleTermsPress = () => {
    props.navigation.navigate('TermsOfService');
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Growth Tracker</Text>
        </View>

        {/* Home Button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleHomePress}>
          <Icon
            name="home"
            size={24}
            color={colors.text}
            style={styles.menuIcon}
          />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Children Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : children.length > 0 ? (
            children.map((child: Child) => {
              const age = getCurrentAge(child.birthDate);
              const ageText = formatAge(age);
              return (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childItem}
                  onPress={() => handleChildPress(child.id)}
                >
                  <View style={styles.childIcon}>
                    <Icon
                      name={child.sex === 'male' ? 'face' : 'face'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childAge}>{ageText}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No children added yet</Text>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Settings/Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPress}
          >
            <Icon
              name="lock"
              size={24}
              color={colors.text}
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleTermsPress}>
            <Icon
              name="description"
              size={24}
              color={colors.text}
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Growth Tracker v1.0</Text>
        <Text style={styles.footerSubtext}>
          Data stored locally on your device
        </Text>
      </View>
    </View>
  );
};

const getStyles = (colors: typeof import('../constants/colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: 30,
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    appTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textLight,
      textTransform: 'uppercase',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 4,
    },
    menuIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    menuText: {
      fontSize: 16,
      color: colors.text,
    },
    childItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.background,
      marginBottom: 8,
    },
    childIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    childIconText: {
      fontSize: 20,
    },
    childInfo: {
      flex: 1,
    },
    childName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    childAge: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textLight,
      paddingHorizontal: 12,
      fontStyle: 'italic',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textLight,
      paddingHorizontal: 12,
      fontStyle: 'italic',
    },
    footer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 11,
      color: colors.textLight,
    },
  });

export default CustomDrawerContent;
