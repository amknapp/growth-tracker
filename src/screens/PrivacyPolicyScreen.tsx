/**
 * Privacy Policy Screen
 * Displays the app's privacy policy
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native';
import { privacyPolicyContent } from '../content/privacyPolicy';
import { useTheme } from '../hooks/useTheme';

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();

  // Helper function to render text with inline bold formatting
  const renderTextWithBold = (
    text: string,
    baseStyle: TextStyle | TextStyle[],
  ) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={i} style={[baseStyle, styles.boldInline]}>
            {part.replace(/\*\*/g, '')}
          </Text>
        );
      }
      return (
        <Text key={i} style={baseStyle}>
          {part}
        </Text>
      );
    });
  };

  // Parse markdown-style content for simple rendering
  const renderContent = () => {
    const lines = privacyPolicyContent.split('\n');
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
      // Bold text (full line)
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={styles.bold}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      }
      // Bullet points (with possible inline bold)
      if (line.startsWith('- ')) {
        const bulletText = line.replace('- ', '');
        return (
          <Text key={index} style={styles.bullet}>
            • {renderTextWithBold(bulletText, styles.bullet)}
          </Text>
        );
      }
      // Empty lines
      if (line.trim() === '') {
        return <View key={index} style={styles.spacing} />;
      }
      // Regular text (with possible inline bold)
      return (
        <Text key={index} style={styles.text}>
          {renderTextWithBold(line, styles.text)}
        </Text>
      );
    });
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
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
    boldInline: {
      fontWeight: 'bold',
      color: colors.text,
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
  });

export default PrivacyPolicyScreen;
