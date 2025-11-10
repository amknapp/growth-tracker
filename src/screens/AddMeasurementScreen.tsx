/**
 * Add Measurement Screen
 * Form to add a new measurement for a child
 */

import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddMeasurementNavigationProp, AddMeasurementRouteProp } from '../types/navigation';
import { Measurement, MeasurementType } from '../types';
import SecureStorage from '../services/SecureStorage';
import { Colors } from '../constants/colors';

interface Props {
  navigation: AddMeasurementNavigationProp;
  route: AddMeasurementRouteProp;
}

const AddMeasurementScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const drawerNavigation = useNavigation();

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  const handleDateChange = (
    _event: {type: string; nativeEvent: {timestamp: number}},
    selectedDate?: Date
  ) => {
    // On Android, the picker closes automatically after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (dateValue: Date): string => {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    // Check if at least one measurement is entered
    if (!weight.trim() && !height.trim() && !headCircumference.trim()) {
      Alert.alert('Error', 'Please enter at least one measurement');
      return;
    }

    // Validate date is not in the future
    if (date > new Date()) {
      Alert.alert('Error', 'Measurement date cannot be in the future');
      return;
    }

    // Validate and collect measurements
    const measurementsToSave: Array<{type: MeasurementType, value: number}> = [];

    if (weight.trim()) {
      const numWeight = parseFloat(weight);
      if (isNaN(numWeight) || numWeight <= 0) {
        Alert.alert('Error', 'Please enter a valid positive number for weight');
        return;
      }
      measurementsToSave.push({ type: 'weight', value: numWeight });
    }

    if (height.trim()) {
      const numHeight = parseFloat(height);
      if (isNaN(numHeight) || numHeight <= 0) {
        Alert.alert('Error', 'Please enter a valid positive number for height');
        return;
      }
      measurementsToSave.push({ type: 'height', value: numHeight });
    }

    if (headCircumference.trim()) {
      const numHead = parseFloat(headCircumference);
      if (isNaN(numHead) || numHead <= 0) {
        Alert.alert('Error', 'Please enter a valid positive number for head circumference');
        return;
      }
      measurementsToSave.push({ type: 'headCircumference', value: numHead });
    }

    setSaving(true);

    try {
      // Save all measurements
      for (let i = 0; i < measurementsToSave.length; i++) {
        const measurement = measurementsToSave[i];
        const newMeasurement: Measurement = {
          id: `${Date.now()}-${i}`,
          childId,
          date: formatDate(date),
          type: measurement.type,
          value: measurement.value,
          notes: notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        await SecureStorage.addMeasurement(newMeasurement);
      }

      // Navigate back immediately - no need for success alert
      navigation.goBack();
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert('Error', 'Failed to save measurements');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Measurement</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Enter measurements (optional for each)</Text>
        <Text style={styles.sectionSubtitle}>Fill in any or all measurements taken at the same time</Text>

        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter weight in kg"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Enter height in cm"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Head Circumference (cm)</Text>
        <TextInput
          style={styles.input}
          value={headCircumference}
          onChangeText={setHeadCircumference}
          placeholder="Enter head circumference in cm"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {formatDate(date)}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {Platform.OS === 'ios' && showDatePicker && (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes about this measurement"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Measurement'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default AddMeasurementScreen;
