/**
 * Home Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AddChildScreen from '../screens/AddChildScreen';
import ChildProfileScreen from '../screens/ChildProfileScreen';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import GrowthChartScreen from '../screens/GrowthChartScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeStack = () => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddChild"
      component={AddChildScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ChildProfile"
      component={ChildProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="AddMeasurement"
      component={AddMeasurementScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GrowthChart"
      component={GrowthChartScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default HomeStack;
