/**
 * Home Screen
 * Displays list of children profiles
 */

import React from 'react';
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreenNavigationProp } from '../types/navigation';
import { Child } from '../types';
import { useAppDataStore } from '../store/appDataStore';
import { formatAge, getCurrentAge } from '../utils/ageCalculator';
import { useChildren } from '../hooks/useChildren'; // Import the new hook
import { useTheme } from '../hooks/useTheme';
import { logger } from '../utils/logger';

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { children, loading } = useChildren();
  const deleteChild = useAppDataStore(state => state.deleteChild);
  const drawerNavigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // No need to refresh on focus - Zustand store updates automatically

  const handleAddChild = () => {
    navigation.navigate('AddChild');
  };

  const handleChildPress = (childId: string) => {
    navigation.navigate('ChildProfile', { childId });
  };

  const handleDeleteChild = (childId: string, childName: string) => {
    Alert.alert(
      'Delete Child',
      `Are you sure you want to delete ${childName}? This will also delete all their measurements.`,
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
              await deleteChild(childId);
            } catch (error) {
              logger.error('Error deleting child:', error);
              Alert.alert('Error', 'Failed to delete child profile');
            }
          },
        },
      ],
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    childId: string,
    childName: string,
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
          onPress={() => handleDeleteChild(childId, childName)}
          testID={`delete-button-${childId}`} // Add testID here
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Icon name="delete" size={28} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChildItem = ({ item }: { item: Child }) => {
    const age = getCurrentAge(item.birthDate);
    const ageText = formatAge(age);

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item.id, item.name)
        }
        overshootRight={false}
      >
        <TouchableOpacity
          style={styles.childCard}
          onPress={() => handleChildPress(item.id)}
        >
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{item.name}</Text>
            <Text style={styles.childDetails}>
              {item.sex === 'male' ? 'Boy' : 'Girl'} • {ageText}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Children Added</Text>
      <Text style={styles.emptyStateText}>
        Tap the + button below to add your first child profile
      </Text>
    </View>
  );

  const openDrawer = () => {
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Growth Tracker</Text>
      </View>

      <FlatList
        data={children}
        renderItem={renderChildItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      <TouchableOpacity
        style={[
          styles.addButton,
          { marginBottom: Math.max(insets.bottom, 16) },
        ]}
        onPress={handleAddChild}
      >
        <Text style={styles.addButtonText}>+ Add Child</Text>
      </TouchableOpacity>
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
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
    },
    listContainer: {
      padding: 16,
      flexGrow: 1,
    },
    childCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    childInfo: {
      flex: 1,
    },
    childName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    childDetails: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    chevron: {
      fontSize: 24,
      color: colors.textLight,
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      marginTop: 100,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 16,
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
    deleteButtonContainer: {
      justifyContent: 'center',
      marginBottom: 12,
    },
    deleteButton: {
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
      borderRadius: 12,
    },
  });

export default HomeScreen;
