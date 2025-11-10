/**
 * Custom Drawer Content
 * Shows children list for quick switching and app navigation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Child } from '../types';
import SecureStorage from '../services/SecureStorage';
import { getCurrentAge, formatAge } from '../utils/ageCalculator';
import { Colors } from '../constants/colors';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadChildren();
  }, []);

  // Reload children when drawer opens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadChildren();
    });
    return unsubscribe;
  }, [navigation]);

  const loadChildren = async () => {
    try {
      const childrenData = await SecureStorage.getChildren();
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildPress = (childId: string) => {
    // Navigate to the child's profile within the HomeStack
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeStack',
        params: {
          screen: 'ChildProfile',
          params: { childId },
        },
      })
    );
    props.navigation.closeDrawer();
  };

  const handleHomePress = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'HomeStack',
        params: {
          screen: 'Home',
        },
      })
    );
    props.navigation.closeDrawer();
  };

  const handlePrivacyPress = () => {
    props.navigation.navigate('PrivacyPolicy');
  };

  const handleTermsPress = () => {
    props.navigation.navigate('TermsOfService');
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Growth Tracker</Text>
        </View>

        {/* Home Button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleHomePress}>
          <Icon name="home" size={24} color="#333" style={styles.menuIcon} />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Children Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : children.length > 0 ? (
            children.map((child) => {
              const age = getCurrentAge(child.birthDate);
              const ageText = formatAge(age);
              return (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childItem}
                  onPress={() => handleChildPress(child.id)}
                >
                  <View style={styles.childIcon}>
                    <Icon
                      name={child.sex === 'male' ? 'face' : 'face'}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childAge}>{ageText}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No children added yet</Text>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Settings/Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPress}>
            <Icon name="lock" size={24} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleTermsPress}>
            <Icon name="description" size={24} color="#333" style={styles.menuIcon} />
            <Text style={styles.menuText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Growth Tracker v1.0</Text>
        <Text style={styles.footerSubtext}>Data stored locally on your device</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
  },
  childIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childIconText: {
    fontSize: 20,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  childAge: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 12,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 12,
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
  },
});

export default CustomDrawerContent;
