/**
 * Add Child Screen
 * Form to add a new child profile
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
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Child, Sex } from '../types';
import SecureStorage from '../services/SecureStorage';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddChild'>;
}

const AddChildScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!birthDate.trim()) {
      Alert.alert('Error', 'Please enter a birth date');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    // Validate date is not in the future
    const birthDateObj = new Date(birthDate);
    if (birthDateObj > new Date()) {
      Alert.alert('Error', 'Birth date cannot be in the future');
      return;
    }

    setSaving(true);

    try {
      const newChild: Child = {
        id: Date.now().toString(),
        name: name.trim(),
        birthDate: birthDate,
        sex,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await SecureStorage.addChild(newChild);
      Alert.alert('Success', 'Child profile added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving child:', error);
      Alert.alert('Error', 'Failed to save child profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter child's name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Birth Date</Text>
        <TextInput
          style={styles.input}
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="YYYY-MM-DD (e.g., 2023-06-15)"
          placeholderTextColor="#999"
        />
        <Text style={styles.hint}>Format: YYYY-MM-DD</Text>

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
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  sexButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  sexButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  sexButtonTextSelected: {
    color: '#fff',
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

export default AddChildScreen;
