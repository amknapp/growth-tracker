/**
 * Terms of Service Screen
 * Displays the app's terms of service with medical disclaimers
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { termsOfServiceContent } from '../content/termsOfService';

const TermsOfServiceScreen: React.FC = () => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 16,
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 4,
  },
  bold: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 8,
  },
  bullet: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 4,
  },
  spacing: {
    height: 8,
  },
  hr: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 16,
  },
});

export default TermsOfServiceScreen;
