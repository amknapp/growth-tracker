/**
 * Add Measurement Screen
 * Form to add a new measurement for a child
 */

import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import {
  AddMeasurementNavigationProp,
  AddMeasurementRouteProp,
} from '../types/navigation';
import { Measurement, MeasurementType } from '../types';
import { useAppDataStore } from '../store/appDataStore';
import { useTheme } from '../hooks/useTheme';
import {
  getValidationErrorMessage,
  isValidDate,
  isValidMeasurementValue,
  sanitizeNotes,
} from '../utils/validation';
import { logger } from '../utils/logger';
import AppHeader from '../components/AppHeader';

interface Props {
  navigation: AddMeasurementNavigationProp;
  route: AddMeasurementRouteProp;
}

const AddMeasurementScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const addMeasurement = useAppDataStore(state => state.addMeasurement);

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { colors, colorScheme } = useTheme();

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDatePickerDone = () => {
    setDate(tempDate);
    setShowDatePicker(false);
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
    if (!isValidDate(date)) {
      Alert.alert('Error', getValidationErrorMessage('date'));
      return;
    }

    // Sanitize notes
    const sanitizedNotes = notes ? sanitizeNotes(notes) : '';

    // Validate and collect measurements
    const measurementsToSave: Array<{ type: MeasurementType; value: number }> =
      [];

    if (weight.trim()) {
      const numWeight = parseFloat(weight);
      if (!isValidMeasurementValue(numWeight, 'weight')) {
        Alert.alert(
          'Error',
          getValidationErrorMessage(
            'measurement',
            'Weight must be between 0.1 and 300 kg',
          ),
        );
        return;
      }
      measurementsToSave.push({ type: 'weight', value: numWeight });
    }

    if (height.trim()) {
      const numHeight = parseFloat(height);
      if (!isValidMeasurementValue(numHeight, 'height')) {
        Alert.alert(
          'Error',
          getValidationErrorMessage(
            'measurement',
            'Height must be between 20 and 250 cm',
          ),
        );
        return;
      }
      measurementsToSave.push({ type: 'height', value: numHeight });
    }

    if (headCircumference.trim()) {
      const numHead = parseFloat(headCircumference);
      if (!isValidMeasurementValue(numHead, 'headCircumference')) {
        Alert.alert(
          'Error',
          getValidationErrorMessage(
            'measurement',
            'Head circumference must be between 20 and 100 cm',
          ),
        );
        return;
      }
      measurementsToSave.push({ type: 'headCircumference', value: numHead });
    }

    setSaving(true);

    try {
      // Save all measurements
      for (const measurement of measurementsToSave) {
        const newMeasurement: Measurement = {
          id: uuidv4(),
          childId,
          date: formatDate(date),
          type: measurement.type,
          value: measurement.value,
          notes: sanitizedNotes || undefined,
          createdAt: new Date().toISOString(),
        };
        await addMeasurement(newMeasurement);
      }

      // Navigate back immediately - no need for success alert
      navigation.goBack();
    } catch (error) {
      logger.error('Error saving measurements', error);
      Alert.alert('Error', 'Failed to save measurements');
    } finally {
      setSaving(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <AppHeader title="Add Measurement" />
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            Enter measurements (optional for each)
          </Text>
          <Text style={styles.sectionSubtitle}>
            Fill in any or all measurements taken at the same time
          </Text>

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight in kg"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter height in cm"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Head Circumference (cm)</Text>
          <TextInput
            style={styles.input}
            value={headCircumference}
            onChangeText={setHeadCircumference}
            placeholder="Enter head circumference in cm"
            placeholderTextColor={colors.textLight}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              Keyboard.dismiss();
              setTempDate(date);
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant={colorScheme}
                style={styles.datePicker}
              />
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDatePickerDone}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this measurement"
            placeholderTextColor={colors.textLight}
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
    content: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    notesInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    hint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    dateButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
    },
    datePicker: {
      width: '100%',
      height: 380,
      marginTop: 8,
    },
    doneButton: {
      backgroundColor: colors.primary,
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.textLight,
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
      color: colors.textSecondary,
      fontSize: 16,
    },
  });

export default AddMeasurementScreen;
