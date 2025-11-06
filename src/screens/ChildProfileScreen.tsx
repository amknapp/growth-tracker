/**
 * Child Profile Screen
 * Displays child's information and growth measurements
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation, DrawerActions } from '@react-navigation/native';
import { ChildProfileNavigationProp, ChildProfileRouteProp } from '../types/navigation';
import { Child, Measurement } from '../types';
import SecureStorage from '../services/SecureStorage';
import { getCurrentAge, formatAge } from '../utils/ageCalculator';
import { Colors } from '../constants/colors';

interface Props {
  navigation: ChildProfileNavigationProp;
  route: ChildProfileRouteProp;
}

const ChildProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const [child, setChild] = useState<Child | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const drawerNavigation = useNavigation();

  const loadData = async () => {
    try {
      const childData = await SecureStorage.getChild(childId);
      const measurementsData = await SecureStorage.getMeasurementsForChild(childId);

      setChild(childData);
      setMeasurements(measurementsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [childId])
  );

  const handleAddMeasurement = () => {
    navigation.navigate('AddMeasurement', { childId });
  };

  const handleViewChart = (measurementType: string) => {
    navigation.navigate('GrowthChart', { childId, measurementType });
  };

  const getLatestMeasurement = (type: string): string => {
    const typedMeasurements = measurements.filter(m => m.type === type);
    if (typedMeasurements.length === 0) return 'No data';

    const latest = typedMeasurements[typedMeasurements.length - 1];
    const unit = type === 'weight' ? 'kg' : 'cm';
    return `${latest.value.toFixed(1)} ${unit}`;
  };

  if (!child) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Child not found</Text>
      </View>
    );
  }

  const age = getCurrentAge(child.birthDate);
  const ageText = formatAge(age);

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

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
              await SecureStorage.deleteMeasurement(measurementId);
              await loadData();
            } catch (error) {
              console.error('Error deleting measurement:', error);
              Alert.alert('Error', 'Failed to delete measurement');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    measurementId: string
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={openDrawer}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.name}>{child.name}</Text>
          </View>
        </View>
        <Text style={styles.details}>
          {child.sex === 'male' ? 'Boy' : 'Girl'} • {ageText}
        </Text>
        <Text style={styles.birthDate}>Born: {child.birthDate}</Text>
      </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButton: {
    padding: 4,
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  details: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  birthDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  measurementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#666',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
  },
  addButton: {
    backgroundColor: Colors.primary,
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
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  historyNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 100,
  },
  deleteButtonContainer: {
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 8,
  },
});

export default ChildProfileScreen;
