/**
 * Add Child Screen
 * Form to add a new child profile
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
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import { RootStackParamList } from '../types/navigation';
import { Child, Sex } from '../types';
import { useAppDataStore } from '../store/appDataStore';
import { useTheme } from '../hooks/useTheme';
import {
  getValidationErrorMessage,
  isValidDate,
  isValidName,
  sanitizeName,
} from '../utils/validation';
import { logger } from '../utils/logger';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddChild'>;
}

const AddChildScreen: React.FC<Props> = ({ navigation }) => {
  const addChild = useAppDataStore(state => state.addChild);
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);
  const drawerNavigation = useNavigation();
  const { colors, colorScheme } = useTheme();

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDatePickerDone = () => {
    setBirthDate(tempDate);
    setShowDatePicker(false);
  };

  const formatDate = (dateValue: Date | null): string => {
    if (!dateValue) {
      return '';
    }
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const day = String(dateValue.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    // Sanitize and validate name
    const sanitizedName = sanitizeName(name);

    if (!sanitizedName) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!isValidName(sanitizedName)) {
      Alert.alert('Error', getValidationErrorMessage('name'));
      return;
    }

    if (!birthDate) {
      Alert.alert('Error', 'Please select a birth date');
      return;
    }

    // Validate date is not in the future
    if (!isValidDate(birthDate)) {
      Alert.alert('Error', getValidationErrorMessage('date'));
      return;
    }

    setSaving(true);

    try {
      const newChild: Child = {
        id: uuidv4(),
        name: sanitizedName,
        birthDate: formatDate(birthDate),
        sex,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addChild(newChild);
      Alert.alert('Success', 'Child profile added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      logger.error('Error saving child', error);
      Alert.alert('Error', 'Failed to save child profile');
    } finally {
      setSaving(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Child</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter child's name"
          placeholderTextColor={colors.textLight}
        />

        <Text style={styles.label}>Birth Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            Keyboard.dismiss();
            setTempDate(birthDate || new Date());
            setShowDatePicker(true);
          }}
        >
          <Text style={birthDate ? styles.dateText : styles.datePlaceholder}>
            {birthDate ? formatDate(birthDate) : 'Select birth date'}
          </Text>
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

        <Text style={styles.label}>Sex</Text>
        <View style={styles.sexContainer}>
          <TouchableOpacity
            style={[
              styles.sexButton,
              sex === 'male' && styles.sexButtonSelected,
            ]}
            onPress={() => setSex('male')}
          >
            <Text
              style={[
                styles.sexButtonText,
                sex === 'male' && styles.sexButtonTextSelected,
              ]}
            >
              Boy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sexButton,
              sex === 'female' && styles.sexButtonSelected,
            ]}
            onPress={() => setSex('female')}
          >
            <Text
              style={[
                styles.sexButtonText,
                sex === 'female' && styles.sexButtonTextSelected,
              ]}
            >
              Girl
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Child Profile'}
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
    header: {
      backgroundColor: colors.primary,
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
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
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
    datePlaceholder: {
      fontSize: 16,
      color: colors.textLight,
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
    sexContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    sexButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    sexButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    sexButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    sexButtonTextSelected: {
      color: '#fff',
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

export default AddChildScreen;
