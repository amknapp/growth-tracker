/**
 * Terms of Service Screen
 * Displays the app's terms of service with medical disclaimers
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { termsOfServiceContent } from '../content/termsOfService';
import { useTheme } from '../hooks/useTheme';

const TermsOfServiceScreen: React.FC = () => {
  const { colors } = useTheme();
  const drawerNavigation = useNavigation();

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  // Parse markdown-style content for simple rendering
  const renderContent = () => {
    const lines = termsOfServiceContent.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return (
          <Text key={index} style={styles.h1}>
            {line.replace('# ', '')}
          </Text>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Text key={index} style={styles.h2}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Text key={index} style={styles.h3}>
            {line.replace('### ', '')}
          </Text>
        );
      }
      // Bold text
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={styles.bold}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <Text key={index} style={styles.bullet}>
            • {line.replace('- ', '')}
          </Text>
        );
      }
      // Horizontal rule
      if (line.trim() === '---') {
        return <View key={index} style={styles.hr} />;
      }
      // Empty lines
      if (line.trim() === '') {
        return <View key={index} style={styles.spacing} />;
      }
      // Regular text
      return (
        <Text key={index} style={styles.text}>
          {line}
        </Text>
      );
    });
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: typeof import('../constants/colors').LightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
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
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
      marginTop: 16,
    },
    h3: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    text: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 4,
    },
    bold: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.text,
      lineHeight: 22,
      marginBottom: 8,
      marginTop: 8,
    },
    bullet: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
      marginLeft: 10,
      marginBottom: 4,
    },
    spacing: {
      height: 8,
    },
    hr: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
  });

export default TermsOfServiceScreen;
