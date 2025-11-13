/**
 * Growth Tracker App
 * Tracks children's growth using CDC and WHO growth charts
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DrawerParamList, RootStackParamList } from './src/types/navigation';
import { useAppDataStore } from './src/store/appDataStore';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AddChildScreen from './src/screens/AddChildScreen';
import ChildProfileScreen from './src/screens/ChildProfileScreen';
import AddMeasurementScreen from './src/screens/AddMeasurementScreen';
import GrowthChartScreen from './src/screens/GrowthChartScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';
import ThemeSettingsScreen from './src/screens/ThemeSettingsScreen';

// Custom Drawer
import CustomDrawerContent from './src/components/CustomDrawerContent';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { Colors } from './src/constants/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Stack Navigator for main screens
function HomeStack() {
  return (
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
}

const DrawerContent = (props: DrawerContentComponentProps) => (
  <CustomDrawerContent {...props} />
);

function App() {
  const initialize = useAppDataStore(state => state.initialize);

  // Initialize the store once on app startup (triggers Face ID once)
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GestureHandlerRootView style={styles.container}>
          <SafeAreaProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={Colors.primary}
            />
            <NavigationContainer>
              <Drawer.Navigator
                drawerContent={DrawerContent}
                screenOptions={{
                  drawerStyle: {
                    width: 280,
                  },
                  headerShown: false,
                  swipeEnabled: false,
                }}
              >
                <Drawer.Screen
                  name="HomeStack"
                  component={HomeStack}
                  options={{ title: 'Home' }}
                />
                <Drawer.Screen
                  name="ThemeSettings"
                  component={ThemeSettingsScreen}
                  options={{
                    title: 'Theme Settings',
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="PrivacyPolicy"
                  component={PrivacyPolicyScreen}
                  options={{
                    title: 'Privacy Policy',
                    headerShown: true,
                    headerStyle: {
                      backgroundColor: Colors.primary,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                />
                <Drawer.Screen
                  name="TermsOfService"
                  component={TermsOfServiceScreen}
                  options={{
                    title: 'Terms of Service',
                    headerShown: true,
                    headerStyle: {
                      backgroundColor: Colors.primary,
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                />
              </Drawer.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
