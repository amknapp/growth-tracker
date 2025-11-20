/**
 * Navigation types for React Navigation
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';

export type DrawerParamList = {
  HomeStack: undefined;
  ThemeSettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  AddChild: undefined;
  EditChild: { childId: string };
  ChildProfile: { childId: string };
  AddMeasurement: { childId: string };
  GrowthChart: { childId: string; measurementType: string };
};

export type DrawerNavigationPropType = DrawerNavigationProp<DrawerParamList>;

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type ChildProfileNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChildProfile'
>;

export type ChildProfileRouteProp = RouteProp<
  RootStackParamList,
  'ChildProfile'
>;

export type AddMeasurementNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddMeasurement'
>;

export type AddMeasurementRouteProp = RouteProp<
  RootStackParamList,
  'AddMeasurement'
>;

export type GrowthChartNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GrowthChart'
>;

export type GrowthChartRouteProp = RouteProp<RootStackParamList, 'GrowthChart'>;

export type EditChildNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditChild'
>;

export type EditChildRouteProp = RouteProp<RootStackParamList, 'EditChild'>;
