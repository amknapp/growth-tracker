/**
 * CSV Export Service
 * Handles exporting and sharing measurement data as CSV files
 */

import { Alert, Platform, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Child, Measurement } from '../types';
import { generateCSVFilename, generateMeasurementCSV } from '../utils/csvExport';

/**
 * Export measurements to CSV and share
 * Uses React Native's built-in Share API to share the CSV data
 *
 * @param measurements - Measurements to export
 * @param children - Child profiles for name lookup
 * @param childName - Optional child name for filename
 * @returns Promise that resolves when sharing is complete
 */
export const exportMeasurementsToCSV = async (
  measurements: Measurement[],
  children: Child[],
  childName?: string
): Promise<void> => {
  try {
    if (measurements.length === 0) {
      Alert.alert(
        'No Measurements',
        'There are no measurements to export.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Generate CSV content
    const csvContent = generateMeasurementCSV(measurements, children);
    const filename = generateCSVFilename(childName);

    // On mobile platforms, we can use Share API with the CSV data
    // The user can then save it to Files, send via email, etc.
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // For mobile, we'll save to AsyncStorage temporarily and provide share options
      // This is a workaround since Share API doesn't directly support file sharing
      // In a production app, you'd use react-native-fs or similar

      // Store CSV temporarily
      const storageKey = `@csv_export_${Date.now()}`;
      await AsyncStorage.setItem(storageKey, csvContent);

      // Share the data - on iOS/Android, users can copy or send via apps
      await Share.share({
        message: csvContent,
        title: filename,
      });

      // Clean up after a delay (user might still be using it)
      setTimeout(async () => {
        try {
          await AsyncStorage.removeItem(storageKey);
        } catch {
          // Silent fail on cleanup
        }
      }, 60000); // 1 minute
    } else {
      // For web or other platforms, trigger a download
      // Note: This would need platform-specific implementation
      Alert.alert(
        'Export Ready',
        `CSV data prepared for ${measurements.length} measurements.`,
        [{ text: 'OK' }]
      );
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error exporting CSV:', error);
    Alert.alert(
      'Export Failed',
      'An error occurred while exporting measurements. Please try again.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Export all measurements for a specific child
 *
 * @param childId - ID of the child
 * @param measurements - All measurements
 * @param children - All child profiles
 * @returns Promise that resolves when export is complete
 */
export const exportChildMeasurements = async (
  childId: string,
  measurements: Measurement[],
  children: Child[]
): Promise<void> => {
  const childMeasurements = measurements.filter(m => m.childId === childId);
  const child = children.find(c => c.id === childId);

  await exportMeasurementsToCSV(
    childMeasurements,
    children,
    child?.name
  );
};

/**
 * Export all measurements for all children
 *
 * @param measurements - All measurements
 * @param children - All child profiles
 * @returns Promise that resolves when export is complete
 */
export const exportAllMeasurements = async (
  measurements: Measurement[],
  children: Child[]
): Promise<void> => {
  await exportMeasurementsToCSV(measurements, children);
};
