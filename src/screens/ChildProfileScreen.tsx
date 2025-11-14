/**
 * Child Profile Screen
 * Displays child's information and growth measurements
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import {
  ChildProfileNavigationProp,
  ChildProfileRouteProp,
} from '../types/navigation';
import { Child, Measurement } from '../types';
import { useAppDataStore } from '../store/appDataStore';
import { formatAge, getCurrentAge } from '../utils/ageCalculator';
import { useTheme } from '../hooks/useTheme';
import { logger } from '../utils/logger';
import AppHeader from '../components/AppHeader';

interface Props {
  navigation: ChildProfileNavigationProp;
  route: ChildProfileRouteProp;
}

const ChildProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const getChild = useAppDataStore(state => state.getChild);
  const getMeasurementsForChild = useAppDataStore(
    state => state.getMeasurementsForChild,
  );
  const deleteMeasurement = useAppDataStore(state => state.deleteMeasurement);
  const [child, setChild] = useState<Child | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [_loading, setLoading] = useState(true);
  const { colors } = useTheme();

  const loadData = useCallback(() => {
    try {
      const childData = getChild(childId);
      const measurementsData = getMeasurementsForChild(childId);

      setChild(childData);
      setMeasurements(measurementsData);
    } catch (error) {
      logger.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [childId, getChild, getMeasurementsForChild]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleAddMeasurement = () => {
    navigation.navigate('AddMeasurement', { childId });
  };

  const handleViewChart = (measurementType: string) => {
    navigation.navigate('GrowthChart', { childId, measurementType });
  };

  const getLatestMeasurement = (type: string): string => {
    const typedMeasurements = measurements.filter(m => m.type === type);
    if (typedMeasurements.length === 0) {
      return 'No data';
    }

    const latest = typedMeasurements[typedMeasurements.length - 1];
    const unit = type === 'weight' ? 'kg' : 'cm';
    return `${latest.value.toFixed(1)} ${unit}`;
  };

  const styles = getStyles(colors);

  if (!child) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Child not found</Text>
      </View>
    );
  }

  const age = getCurrentAge(child.birthDate);
  const ageText = formatAge(age);

  const handleDeleteMeasurement = (measurementId: string) => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this measurement?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeasurement(measurementId);
              loadData();
            } catch (error) {
              logger.error('Error deleting measurement:', error);
              Alert.alert('Error', 'Failed to delete measurement');
            }
          },
        },
      ],
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    measurementId: string,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMeasurement(measurementId)}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Icon name="delete" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={child.name}
        subtitle={`${child.sex === 'male' ? 'Boy' : 'Girl'} • ${ageText}`}
        subtitle2={`Born: ${child.birthDate}`}
      />
      <ScrollView style={styles.scrollView}>
        {child.avatarUri && (
          <View style={styles.avatarSection}>
            <Image source={{ uri: child.avatarUri }} style={styles.avatar} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Measurements</Text>

          <TouchableOpacity
            style={styles.measurementCard}
            onPress={() => handleViewChart('weight')}
          >
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementLabel}>Weight</Text>
              <Text style={styles.measurementValue}>
                {getLatestMeasurement('weight')}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.measurementCard}
            onPress={() => handleViewChart('height')}
          >
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementLabel}>Height</Text>
              <Text style={styles.measurementValue}>
                {getLatestMeasurement('height')}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.measurementCard}
            onPress={() => handleViewChart('headCircumference')}
          >
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementLabel}>Head Circumference</Text>
              <Text style={styles.measurementValue}>
                {getLatestMeasurement('headCircumference')}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMeasurement}
        >
          <Text style={styles.addButtonText}>+ Add Measurement</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            All Measurements ({measurements.length})
          </Text>

          {measurements.length === 0 ? (
            <Text style={styles.emptyText}>No measurements yet</Text>
          ) : (
            measurements.map(measurement => (
              <Swipeable
                key={measurement.id}
                renderRightActions={(progress, dragX) =>
                  renderRightActions(progress, dragX, measurement.id)
                }
                overshootRight={false}
              >
                <View style={styles.historyCard}>
                  <Text style={styles.historyDate}>{measurement.date}</Text>
                  <Text style={styles.historyType}>
                    {measurement.type === 'weight'
                      ? 'Weight'
                      : measurement.type === 'height'
                      ? 'Height'
                      : 'Head Circumference'}
                  </Text>
                  <Text style={styles.historyValue}>
                    {measurement.value.toFixed(1)}{' '}
                    {measurement.type === 'weight' ? 'kg' : 'cm'}
                  </Text>
                  {measurement.notes && (
                    <Text style={styles.historyNotes}>{measurement.notes}</Text>
                  )}
                </View>
              </Swipeable>
            ))
          )}
        </View>
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
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 16,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    measurementCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 8,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    measurementInfo: {
      flex: 1,
    },
    measurementLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    measurementValue: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    chevron: {
      fontSize: 24,
      color: colors.textLight,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    historyCard: {
      backgroundColor: colors.card,
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
    },
    historyDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    historyType: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    historyValue: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '500',
    },
    historyNotes: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      fontStyle: 'italic',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 100,
    },
    deleteButtonContainer: {
      justifyContent: 'center',
      marginBottom: 8,
    },
    deleteButton: {
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
      borderRadius: 8,
    },
  });

export default ChildProfileScreen;
