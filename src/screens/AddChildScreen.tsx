/**
 * Add Child Screen
 * Form to add a new child profile
 */

import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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
import AppHeader from '../components/AppHeader';

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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { colors, colorScheme } = useTheme();

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    // On Android, close the picker immediately
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      // Only update the date if user pressed OK (not Cancel)
      if (event.type === 'set' && selectedDate) {
        setBirthDate(selectedDate);
      }
    } else {
      // On iOS, just update the temp date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
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

  const pickImageFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logger.error('Error picking image from gallery', result.errorMessage);
        Alert.alert('Error', 'Failed to select image from gallery');
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      logger.error('Error picking image from gallery', error);
      Alert.alert('Error', 'Failed to select image from gallery');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message:
              'Growth Tracker needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Camera permission is required to take photos.',
          );
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        logger.error('Error taking photo', result.errorMessage);
        Alert.alert('Error', 'Failed to take photo');
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      logger.error('Error taking photo', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showAvatarOptions = () => {
    Alert.alert('Choose Avatar', "Select a photo for your child's profile", [
      {
        text: 'Take Photo',
        onPress: takePhoto,
      },
      {
        text: 'Choose from Gallery',
        onPress: pickImageFromGallery,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
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
        avatarUri: avatarUri || undefined,
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
      <AppHeader title="Add Child" />
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.content}>
          <Text style={styles.label}>Avatar (Optional)</Text>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={showAvatarOptions}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>+</Text>
                </View>
              )}
            </TouchableOpacity>
            {avatarUri && (
              <TouchableOpacity
                style={styles.changeAvatarButton}
                onPress={showAvatarOptions}
              >
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

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
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant={colorScheme}
                style={Platform.OS === 'ios' ? styles.datePicker : undefined}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleDatePickerDone}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
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
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 8,
    },
    avatarButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    avatarPlaceholderText: {
      fontSize: 48,
      color: colors.textLight,
      fontWeight: '300',
    },
    changeAvatarButton: {
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    changeAvatarText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default AddChildScreen;
