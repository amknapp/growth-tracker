import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';
import { useAppDataStore } from '../store/appDataStore';
import { ColorPalette } from '../constants/colors';

const slides = [
  {
    id: '1',
    title: 'Welcome to GrowthTracker!',
    description:
      "Start by adding your child's profile to begin tracking their development journey.",
    icon: 'account-plus',
  },
  {
    id: '2',
    title: 'Track Measurements',
    description:
      'Log height, weight, and head circumference. Keep a detailed history of growth points.',
    icon: 'ruler',
  },
  {
    id: '3',
    title: 'Visualize Growth',
    description:
      "See your child's progress on official CDC & WHO charts with percentiles and z-scores.",
    icon: 'chart-line',
  },
];

const OnboardingScreen = () => {
  const { colors } = useTheme();
  const completeOnboarding = useAppDataStore(state => state.completeOnboarding);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const styles = getStyles(colors);
  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Content Area */}
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Icon name={currentSlide.icon} size={100} color={colors.primary} />
        </View>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </View>

      {/* Indicators */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'space-between',
      padding: 20,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    iconContainer: {
      marginBottom: 40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    footer: {
      paddingBottom: 40,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 30,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border,
      marginHorizontal: 5,
    },
    activeDot: {
      backgroundColor: colors.primary,
      width: 20,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

export default OnboardingScreen;
