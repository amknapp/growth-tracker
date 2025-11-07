/**
 * Growth Tracker App
 * Tracks children's growth using CDC and WHO growth charts
 */

import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList, DrawerParamList } from './src/types/navigation';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AddChildScreen from './src/screens/AddChildScreen';
import ChildProfileScreen from './src/screens/ChildProfileScreen';
import AddMeasurementScreen from './src/screens/AddMeasurementScreen';
import GrowthChartScreen from './src/screens/GrowthChartScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';

// Custom Drawer
import CustomDrawerContent from './src/components/CustomDrawerContent';
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

const DrawerContent = (props: any) => <CustomDrawerContent {...props} />;

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
