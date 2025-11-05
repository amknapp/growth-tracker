/**
 * Add Measurement Screen
 * Form to add a new measurement for a child
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AddMeasurementNavigationProp, AddMeasurementRouteProp } from '../types/navigation';
import { Measurement, MeasurementType } from '../types';
import SecureStorage from '../services/SecureStorage';

interface Props {
  navigation: AddMeasurementNavigationProp;
  route: AddMeasurementRouteProp;
}

const AddMeasurementScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;

  const [measurementType, setMeasurementType] = useState<MeasurementType>('weight');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validate inputs
    if (!value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    // Validate date is not in the future
    const measurementDate = new Date(date);
    if (measurementDate > new Date()) {
      Alert.alert('Error', 'Measurement date cannot be in the future');
      return;
    }

    setSaving(true);

    try {
      const newMeasurement: Measurement = {
        id: Date.now().toString(),
        childId,
        date,
        type: measurementType,
        value: numValue,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await SecureStorage.addMeasurement(newMeasurement);
      Alert.alert('Success', 'Measurement added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving measurement:', error);
      Alert.alert('Error', 'Failed to save measurement');
    } finally {
      setSaving(false);
    }
  };

  const getUnitLabel = (): string => {
    switch (measurementType) {
      case 'weight':
        return 'kg';
      case 'height':
        return 'cm';
      case 'headCircumference':
        return 'cm';
      default:
        return '';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Measurement Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              measurementType === 'weight' && styles.typeButtonSelected,
            ]}
            onPress={() => setMeasurementType('weight')}
          >
            <Text
              style={[
                styles.typeButtonText,
                measurementType === 'weight' && styles.typeButtonTextSelected,
              ]}
            >
              Weight
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              measurementType === 'height' && styles.typeButtonSelected,
            ]}
            onPress={() => setMeasurementType('height')}
          >
            <Text
              style={[
                styles.typeButtonText,
                measurementType === 'height' && styles.typeButtonTextSelected,
              ]}
            >
              Height
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              measurementType === 'headCircumference' && styles.typeButtonSelected,
            ]}
            onPress={() => setMeasurementType('headCircumference')}
          >
            <Text
              style={[
                styles.typeButtonText,
                measurementType === 'headCircumference' &&
                  styles.typeButtonTextSelected,
              ]}
            >
              Head
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Value ({getUnitLabel()})</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={`Enter ${measurementType} in ${getUnitLabel()}`}
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#999"
        />
        <Text style={styles.hint}>Format: YYYY-MM-DD</Text>

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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#fff',
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
  saveButton: {
    backgroundColor: '#4A90E2',
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
