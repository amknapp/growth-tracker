/**
 * App Data Store (Zustand)
 * Memory store for app data with secure storage persistence
 * Face ID is only triggered on initial load and when saving changes
 */

import { create } from 'zustand';
import SecureStorage from '../services/SecureStorage';
import { Child, Measurement } from '../types';
import { logger } from '../utils/logger';

interface AppDataStore {
  // State
  children: Child[];
  measurements: Measurement[];
  hasSeenOnboarding: boolean;
  loading: boolean;
  initialized: boolean;
  error: Error | null;

  // Actions
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addChild: (child: Child) => Promise<void>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  getChild: (childId: string) => Child | null;
  addMeasurement: (measurement: Measurement) => Promise<void>;
  updateMeasurement: (
    measurementId: string,
    updates: Partial<Measurement>,
  ) => Promise<void>;
  deleteMeasurement: (measurementId: string) => Promise<void>;
  getMeasurementsForChild: (childId: string) => Measurement[];
  getMeasurementsByType: (childId: string, type: string) => Measurement[];
}

export const useAppDataStore = create<AppDataStore>((set, get) => ({
  // Initial state
  children: [],
  measurements: [],
  hasSeenOnboarding: false,
  loading: false,
  initialized: false,
  error: null,

  // Initialize: Load data from secure storage once (triggers Face ID once)
  // Initialize: Load data from secure storage once (triggers Face ID once)
  initialize: async () => {
    const state = get();
    if (state.initialized || state.loading) {
      return; // Already initialized or currently loading
    }

    set({ loading: true, error: null });
    try {
      const data = await SecureStorage.loadData();
      set({
        children: data.children,
        measurements: data.measurements,
        hasSeenOnboarding: !!data.hasSeenOnboarding,
        initialized: true,
        loading: false,
      });
    } catch (error) {
      logger.error('Error initializing app data:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  completeOnboarding: async () => {
    const { children, measurements } = get();
    set({ hasSeenOnboarding: true });

    try {
      await SecureStorage.saveData({
        children,
        measurements,
        hasSeenOnboarding: true,
      });
    } catch (error) {
      logger.error('Error saving onboarding status:', error);
      set({ hasSeenOnboarding: false });
      throw error;
    }
  },

  // Add child: Update memory + persist to secure storage
  addChild: async (child: Child) => {
    const { children, measurements } = get();
    const newChildren = [...children, child];

    set({ children: newChildren });

    try {
      await SecureStorage.saveData({
        children: newChildren,
        measurements,
        hasSeenOnboarding: get().hasSeenOnboarding,
      });
    } catch (error) {
      logger.error('Error adding child:', error);
      // Rollback on error
      set({ children });
      throw error;
    }
  },

  // Update child: Update memory + persist to secure storage
  updateChild: async (childId: string, updates: Partial<Child>) => {
    const { children, measurements } = get();
    const childIndex = children.findIndex(c => c.id === childId);

    if (childIndex === -1) {
      throw new Error('Child not found');
    }

    const newChildren = [...children];
    newChildren[childIndex] = {
      ...newChildren[childIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    set({ children: newChildren });

    try {
      await SecureStorage.saveData({
        children: newChildren,
        measurements,
        hasSeenOnboarding: get().hasSeenOnboarding,
      });
    } catch (error) {
      logger.error('Error updating child:', error);
      // Rollback on error
      set({ children });
      throw error;
    }
  },

  // Delete child: Update memory + persist to secure storage
  deleteChild: async (childId: string) => {
    const { children, measurements } = get();
    const newChildren = children.filter(c => c.id !== childId);
    const newMeasurements = measurements.filter(m => m.childId !== childId);

    set({ children: newChildren, measurements: newMeasurements });

    try {
      await SecureStorage.saveData({
        children: newChildren,
        measurements: newMeasurements,
        hasSeenOnboarding: get().hasSeenOnboarding,
      });
    } catch (error) {
      logger.error('Error deleting child:', error);
      // Rollback on error
      set({ children, measurements });
      throw error;
    }
  },

  // Get child: Read from memory (no Face ID)
  getChild: (childId: string) => {
    const { children } = get();
    return children.find(c => c.id === childId) || null;
  },

  // Add measurement: Update memory + persist to secure storage
  addMeasurement: async (measurement: Measurement) => {
    const { children, measurements } = get();
    const newMeasurements = [...measurements, measurement];

    set({ measurements: newMeasurements });

    try {
      await SecureStorage.saveData({
        children,
        measurements: newMeasurements,
        hasSeenOnboarding: get().hasSeenOnboarding,
      });
    } catch (error) {
      logger.error('Error adding measurement:', error);
      // Rollback on error
      set({ measurements });
      throw error;
    }
  },

  // Update measurement: Update memory + persist to secure storage
  updateMeasurement: async (
    measurementId: string,
    updates: Partial<Measurement>,
  ) => {
    const { children, measurements } = get();
    const measurementIndex = measurements.findIndex(
      m => m.id === measurementId,
    );

    if (measurementIndex === -1) {
      throw new Error('Measurement not found');
    }

    const newMeasurements = [...measurements];
    newMeasurements[measurementIndex] = {
      ...newMeasurements[measurementIndex],
      ...updates,
    };

    set({ measurements: newMeasurements });

    try {
      await SecureStorage.saveData({
        children,
        measurements: newMeasurements,
        hasSeenOnboarding: get().hasSeenOnboarding,
      });
    } catch (error) {
      logger.error('Error updating measurement:', error);
      // Rollback on error
      set({ measurements });
      throw error;
    }
  },

  // Delete measurement: Update memory + persist to secure storage
  deleteMeasurement: async (measurementId: string) => {
    const { children, measurements } = get();
    const newMeasurements = measurements.filter(m => m.id !== measurementId);

    set({ measurements: newMeasurements });

    try {
      await SecureStorage.saveData({
        children,
        measurements: newMeasurements,
        hasSeenOnboarding: get().hasSeenOnboarding,
      });
    } catch (error) {
      logger.error('Error deleting measurement:', error);
      // Rollback on error
      set({ measurements });
      throw error;
    }
  },

  // Get measurements for child: Read from memory (no Face ID)
  getMeasurementsForChild: (childId: string) => {
    const { measurements } = get();
    return measurements
      .filter(m => m.childId === childId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  // Get measurements by type: Read from memory (no Face ID)
  getMeasurementsByType: (childId: string, type: string) => {
    const { measurements } = get();
    return measurements
      .filter(m => m.childId === childId && m.type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
}));
