# Growth Tracker - Project Summary

## Overview
A production-ready React Native app for tracking children's growth using official CDC and WHO growth charts with secure, encrypted data storage.

## Tech Stack

### Core Framework
- **React Native**: 0.82.1 (latest, with New Architecture enabled)
- **TypeScript**: Full type safety
- **Platform**: iOS & Android

### Key Dependencies
```json
{
  "react-native": "0.82.1",
  "react-native-reanimated": "4.1.3",
  "react-native-worklets": "0.6.1",
  "react-native-worklets-core": "1.6.2",
  "react-native-gesture-handler": "2.29.1",
  "@shopify/react-native-skia": "2.3.10",
  "victory-native": "41.20.1",
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "react-native-keychain": "^8.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "papaparse": "^5.x",
  "date-fns": "^2.x"
}
```

## Features

### 1. Secure Data Storage
- **iOS**: Keychain Services with biometric protection
- **Android**: Keystore System with hardware-backed encryption
- **Zero Server Communication**: All data stays on device
- **SecureStorage Service**: `src/services/SecureStorage.ts`

### 2. Official CDC Growth Charts
- **Real-time Fetching**: Downloads official CDC CSV data from CDC.gov
- **Smart Caching**: 30-day cache with offline fallback
- **Complete Datasets**:
  - Weight-for-age (birth to 20 years)
  - Height-for-age (birth to 20 years)
  - Head circumference-for-age (birth to 36 months)
- **CDCDataService**: `src/services/CDCDataService.ts`

### 3. Animated Growth Charts
- **Victory Native v41**: Modern CartesianChart API
- **Skia Rendering**: Hardware-accelerated graphics
- **Beautiful Animations**: Spring and timing animations
- **Features**:
  - 5 percentile curves (5th, 25th, 50th, 75th, 95th)
  - Child's actual measurements plotted
  - Scatter points for each measurement
  - Smooth transitions when changing views

### 4. Percentile Calculations
- **LMS Method**: Industry-standard Lambda-Mu-Sigma algorithm
- **Accurate**: Interpolates between data points
- **Real-time**: Calculates percentiles as data is entered
- **Implementation**: `src/utils/percentileCalculator.ts`

### 5. Age Calculations
- **Precise**: Calculates age in months with decimal precision
- **Multiple Formats**: Years, months, total months, total days
- **Date-fns**: Reliable date manipulation
- **Implementation**: `src/utils/ageCalculator.ts`

## Project Structure

```
GrowthTracker/
├── src/
│   ├── components/          # Reusable UI components
│   ├── data/               # Growth chart reference data
│   │   ├── cdcData.ts     # CDC LMS data (local fallback)
│   │   └── whoData.ts     # WHO LMS data
│   ├── screens/           # Application screens
│   │   ├── HomeScreen.tsx
│   │   ├── AddChildScreen.tsx
│   │   ├── ChildProfileScreen.tsx
│   │   ├── AddMeasurementScreen.tsx
│   │   └── GrowthChartScreen.tsx
│   ├── services/          # Business logic
│   │   ├── SecureStorage.ts
│   │   └── CDCDataService.ts
│   ├── types/             # TypeScript definitions
│   │   ├── index.ts
│   │   └── navigation.ts
│   └── utils/             # Utility functions
│       ├── ageCalculator.ts
│       └── percentileCalculator.ts
├── android/               # Android native code
├── ios/                   # iOS native code
├── App.tsx               # Main app entry
└── index.js              # React Native entry
```

## Screens

### 1. HomeScreen
- Lists all children profiles
- Shows name, sex, and current age
- Add new child button
- Empty state for first use

### 2. AddChildScreen
- Form to add new child profile
- Fields: Name, Birth Date, Sex
- Date format: YYYY-MM-DD
- Validation for required fields and future dates

### 3. ChildProfileScreen
- Displays child information
- Shows latest measurements (weight, height, head circ)
- List of all historical measurements
- Navigation to growth charts
- Add measurement button

### 4. AddMeasurementScreen
- Form to add new measurement
- Select measurement type (weight/height/head circ)
- Enter value with appropriate units (kg/cm)
- Date picker
- Optional notes field

### 5. GrowthChartScreen
- Animated Victory Native chart
- Toggle between CDC and WHO standards
- Shows:
  - Percentile reference curves (gray, dashed)
  - Child's actual measurements (blue line + dots)
  - Latest percentile with interpretation
  - All measurements list
- Loading states with spinners
- Error handling with fallback to local data

## Data Flow

### Adding a Measurement
1. User enters measurement in AddMeasurementScreen
2. Data validated (positive number, valid date)
3. Measurement object created with unique ID
4. Saved to SecureStorage (encrypted)
5. User returned to ChildProfileScreen
6. Latest measurements updated automatically

### Viewing Growth Chart
1. User taps measurement type on ChildProfileScreen
2. GrowthChartScreen loads child data from SecureStorage
3. CDC data fetched (or loaded from cache)
4. Child's measurements converted to chart format
5. Percentile curves generated from CDC LMS data
6. Data merged and sorted by age
7. CartesianChart renders with animations
8. Latest percentile calculated and displayed

### CDC Data Fetching
1. First chart view triggers data fetch
2. CDCDataService checks cache validity (< 30 days)
3. If valid: Load from AsyncStorage
4. If invalid: Fetch CSV from CDC.gov
5. Parse CSV with PapaParse
6. Transform to GrowthChartDataPoint format
7. Save to AsyncStorage with timestamp
8. Return data to chart

## Animations

### Victory Native Animations
```typescript
// Percentile curves - Timing animation
animate={{ type: 'timing', duration: 300 }}

// Child's data - Spring animation
animate={{ type: 'spring', duration: 500 }}
```

- **Smooth Rendering**: Skia hardware acceleration
- **Responsive**: Updates in real-time as data changes
- **Spring Physics**: Natural bounce effect for user data
- **Timing**: Linear interpolation for background curves

## Security Features

### Data Encryption
- **iOS Keychain**: AES-256 encryption
- **Android Keystore**: Hardware-backed keys
- **Biometric Protection**: Face ID / Touch ID / Fingerprint
- **No Cloud Sync**: Data never leaves device

### Access Control
```typescript
accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE
```

### Data Validation
- Input sanitization on all forms
- Date validation (not in future)
- Numeric validation (positive values)
- Type safety with TypeScript

## Performance Optimizations

### Caching Strategy
- **CDC Data**: 30-day cache in AsyncStorage
- **Deduplication**: Prevents multiple simultaneous fetches
- **Lazy Loading**: Data fetched only when needed
- **Background Updates**: Cache refresh transparent to user

### Chart Performance
- **Skia**: Hardware-accelerated rendering
- **Data Sampling**: Interpolates for smooth curves
- **Memoization**: Prevents unnecessary recalculations
- **Virtual Scrolling**: Efficient list rendering

## Configuration

### New Architecture
```gradle
// android/gradle.properties
newArchEnabled=true
```

### Babel Configuration
```javascript
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

### Entry Point
```javascript
// index.js
import 'react-native-gesture-handler';
import 'react-native-reanimated';
```

## Building

### Development
```bash
# Start Metro bundler
npx react-native start --reset-cache

# Run on Android
npx react-native run-android

# Run on iOS (macOS only)
npx react-native run-ios
```

### Production Build
```bash
# Android APK
cd android
./gradlew assembleRelease

# iOS Archive (macOS only)
cd ios
xcodebuild archive -workspace GrowthTracker.xcworkspace -scheme GrowthTracker
```

## Testing Checklist

- [ ] Add child profile
- [ ] Validate date format (YYYY-MM-DD)
- [ ] Add weight measurement
- [ ] Add height measurement
- [ ] Add head circumference measurement
- [ ] View growth chart (weight)
- [ ] Verify CDC data fetches
- [ ] Check percentile calculation
- [ ] Verify chart animations
- [ ] Toggle CDC/WHO standards
- [ ] Test offline mode (airplane mode)
- [ ] Verify cached data usage
- [ ] Add multiple measurements
- [ ] Check historical list
- [ ] Delete child (if implemented)
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Verify biometric unlock

## Known Limitations

1. **WHO Data**: Currently uses local sample data (not fetched like CDC)
2. **Date Picker**: Manual YYYY-MM-DD entry (could add native picker)
3. **Export**: No data export/backup functionality yet
4. **Multiple Charts**: Can't view multiple chart types simultaneously
5. **BMI**: CDC BMI-for-age data fetched but not displayed

## Future Enhancements

1. **WHO Data Service**: Fetch WHO data like CDC
2. **Native Date Picker**: Better UX for date entry
3. **Data Export**: CSV/PDF export of measurements
4. **Print Charts**: Generate printable growth charts
5. **Reminders**: Notifications for upcoming measurements
6. **Multiple Children Comparison**: Compare siblings
7. **Milestone Tracking**: Developmental milestones
8. **Medical Notes**: Integration with doctor visits
9. **Photo Timeline**: Photos alongside measurements
10. **Family Sharing**: Secure sharing between parents

## Credits

- **CDC Growth Charts**: Centers for Disease Control and Prevention
- **WHO Growth Standards**: World Health Organization
- **Victory Native**: Nearform/Commerce
- **React Native**: Meta Platforms, Inc.

## License

[Specify your license here]

## Disclaimer

This app is for informational purposes only. Always consult healthcare professionals for medical advice regarding child growth and development. Growth percentiles are statistical tools and should be interpreted by qualified medical practitioners.
