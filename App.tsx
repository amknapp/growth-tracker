/**
 * Growth Tracker App
 * Tracks children's growth using CDC and WHO growth charts
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/types/navigation';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AddChildScreen from './src/screens/AddChildScreen';
import ChildProfileScreen from './src/screens/ChildProfileScreen';
import AddMeasurementScreen from './src/screens/AddMeasurementScreen';
import GrowthChartScreen from './src/screens/GrowthChartScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4A90E2',
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
            options={{ title: 'Add Child' }}
          />
          <Stack.Screen
            name="ChildProfile"
            component={ChildProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddMeasurement"
            component={AddMeasurementScreen}
            options={{ title: 'Add Measurement' }}
          />
          <Stack.Screen
            name="GrowthChart"
            component={GrowthChartScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
