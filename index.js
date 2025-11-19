/**
 * @format
 */

// IMPORTANT: react-native-reanimated must be imported first to avoid EventEmitter errors on iOS
import 'react-native-reanimated';
import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
