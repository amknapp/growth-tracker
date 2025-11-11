/**
 * Secure Storage Service
 * Uses react-native-keychain for platform-level secure storage
 * - iOS: Keychain Services
 * - Android: Keystore System
 */

import * as Keychain from 'react-native-keychain';
import { AppData, Child, Measurement } from '../types';
import { recoverAppData } from '../utils/dataValidation';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'growth_tracker_data';

/**
 * SecureStorage class for managing encrypted data persistence
 */
class SecureStorage {
  /**
   * Save all app data securely
   */
  async saveData(data: AppData): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await Keychain.setGenericPassword(STORAGE_KEY, jsonData, {
        service: STORAGE_KEY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        // Use BIOMETRY_ANY to allow data access even if biometric data changes
        // This prevents catastrophic data loss when users add/change fingerprints or Face ID
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      });
    } catch (error) {
      logger.error('Error saving data', error);
      throw new Error('Failed to save data securely');
    }
  }

  /**
   * Load all app data from secure storage
   */
  async loadData(): Promise<AppData> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: STORAGE_KEY,
      });

      if (!credentials) {
        // Return empty data structure if no data exists
        return {
          children: [],
          measurements: [],
        };
      }

      const data = JSON.parse(credentials.password);

      // Validate and recover data if corrupted
      return recoverAppData(data);
    } catch (error) {
      logger.error('Error loading data', error);
      throw new Error('Failed to load data securely');
    }
  }

  /**
   * Add a new child profile
   */
  async addChild(child: Child): Promise<void> {
    const data = await this.loadData();
    data.children.push(child);
    await this.saveData(data);
  }

  /**
   * Update an existing child profile
   */
  async updateChild(childId: string, updates: Partial<Child>): Promise<void> {
    const data = await this.loadData();
    const index = data.children.findIndex(c => c.id === childId);

    if (index === -1) {
      throw new Error('Child not found');
    }

    data.children[index] = {
      ...data.children[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveData(data);
  }

  /**
   * Delete a child profile and all their measurements
   */
  async deleteChild(childId: string): Promise<void> {
    const data = await this.loadData();
    data.children = data.children.filter(c => c.id !== childId);
    data.measurements = data.measurements.filter(m => m.childId !== childId);
    await this.saveData(data);
  }

  /**
   * Get all children
   */
  async getChildren(): Promise<Child[]> {
    const data = await this.loadData();
    return data.children;
  }

  /**
   * Get a specific child by ID
   */
  async getChild(childId: string): Promise<Child | null> {
    const data = await this.loadData();
    return data.children.find(c => c.id === childId) || null;
  }

  /**
   * Add a new measurement
   */
  async addMeasurement(measurement: Measurement): Promise<void> {
    const data = await this.loadData();
    data.measurements.push(measurement);
    await this.saveData(data);
  }

  /**
   * Update an existing measurement
   */
  async updateMeasurement(
    measurementId: string,
    updates: Partial<Measurement>,
  ): Promise<void> {
    const data = await this.loadData();
    const index = data.measurements.findIndex(m => m.id === measurementId);

    if (index === -1) {
      throw new Error('Measurement not found');
    }

    data.measurements[index] = {
      ...data.measurements[index],
      ...updates,
    };

    await this.saveData(data);
  }

  /**
   * Delete a measurement
   */
  async deleteMeasurement(measurementId: string): Promise<void> {
    const data = await this.loadData();
    data.measurements = data.measurements.filter(m => m.id !== measurementId);
    await this.saveData(data);
  }

  /**
   * Get all measurements for a specific child
   */
  async getMeasurementsForChild(childId: string): Promise<Measurement[]> {
    const data = await this.loadData();
    return data.measurements
      .filter(m => m.childId === childId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get measurements of a specific type for a child
   */
  async getMeasurementsByType(
    childId: string,
    type: string,
  ): Promise<Measurement[]> {
    const measurements = await this.getMeasurementsForChild(childId);
    return measurements.filter(m => m.type === type);
  }

  /**
   * Clear all data (use with caution)
   */
  async clearAllData(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: STORAGE_KEY });
    } catch (error) {
      logger.error('Error clearing data', error);
      throw new Error('Failed to clear data');
    }
  }
}

// Export singleton instance
export default new SecureStorage();
