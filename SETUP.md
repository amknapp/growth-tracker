# Growth Tracker - Setup Guide

A React Native application for tracking children's growth using CDC and WHO growth charts with secure, platform-level data storage.

## Features

- **Secure Data Storage**: Uses iOS Keychain and Android Keystore for encrypted data storage
- **Official CDC Data**: Fetches real CDC growth chart data directly from CDC.gov
- **Smart Caching**: 30-day cache with offline fallback support
- **CDC & WHO Growth Charts**: Support for both CDC and WHO growth standards
- **Multiple Measurements**: Track weight, height, and head circumference
- **Percentile Calculations**: Automatic percentile calculation using LMS method
- **Interactive Charts**: Visual growth charts with percentile curves
- **Age Calculation**: Automatic age calculation based on birthdate
- **Multiple Children**: Support for tracking multiple children

## Security

All data is stored securely using platform-level encryption:
- **iOS**: Keychain Services with biometric/passcode protection
- **Android**: Keystore System with hardware-backed encryption

Data never leaves the device and is not transmitted to any servers.

## Prerequisites

- Node.js (v18 or higher)
- React Native development environment
- For iOS: Xcode and CocoaPods (macOS only)
- For Android: Android Studio and JDK

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS (macOS only):
```bash
cd ios
pod install
cd ..
```

3. For Android, ensure you have the Android SDK installed and configured.

## Running the App

### iOS (macOS only)
```bash
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## Project Structure

```
GrowthTracker/
├── src/
│   ├── components/       # Reusable UI components
│   ├── data/            # CDC and WHO growth chart data
│   │   ├── cdcData.ts
│   │   └── whoData.ts
│   ├── screens/         # Application screens
│   │   ├── HomeScreen.tsx
│   │   ├── AddChildScreen.tsx
│   │   ├── ChildProfileScreen.tsx
│   │   ├── AddMeasurementScreen.tsx
│   │   └── GrowthChartScreen.tsx
│   ├── services/        # Business logic and data management
│   │   └── SecureStorage.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── index.ts
│   │   └── navigation.ts
│   └── utils/           # Utility functions
│       ├── ageCalculator.ts
│       └── percentileCalculator.ts
└── App.tsx             # Main application entry point
```

## Native Configuration

### iOS

The app uses the following iOS capabilities:
- Keychain Services (automatic)
- Biometric authentication (FaceID/TouchID)

No additional configuration needed - handled automatically by react-native-keychain.

### Android

The app requires minimum API level 23 (Android 6.0) for Keystore support.

Ensure your `android/app/build.gradle` has:
```gradle
minSdkVersion = 23
```

## Data Models

### Child Profile
- Name
- Birth date
- Sex (male/female)
- Created/updated timestamps

### Measurement
- Value (kg for weight, cm for height/head circumference)
- Date
- Type (weight, height, headCircumference)
- Optional notes

## Growth Chart Data

### CDC Data (Production-Ready)

The app **automatically fetches official CDC growth chart data** from CDC.gov:

- Data is fetched on-demand when viewing growth charts
- Cached locally for 30 days to minimize network usage
- Includes complete datasets for all age ranges:
  - Weight-for-age (birth to 20 years)
  - Height-for-age (birth to 20 years)
  - Head circumference-for-age (birth to 36 months)
  - BMI-for-age (2 to 20 years)

**Network Requirements:**
- Internet connection needed for first-time data download
- Subsequent views use cached data
- Offline fallback to local sample data if network unavailable

See `CDC_DATA_INTEGRATION.md` for detailed information about data fetching, caching, and offline behavior.

### WHO Data

WHO growth chart data currently uses local sample data in `src/data/whoData.ts`.

For complete WHO data, you can:
1. Download datasets from: https://www.who.int/tools/child-growth-standards/standards
2. Update `whoData.ts` with complete LMS values
3. Or implement a similar fetching service like CDC (see `CDCDataService.ts`)

## Percentile Calculation

The app uses the LMS method (Lambda-Mu-Sigma) for percentile calculations:
- **L**: Skewness parameter
- **M**: Median value
- **S**: Coefficient of variation

Formula: `Z = ((value/M)^L - 1) / (L * S)`

## Troubleshooting

### iOS Build Issues
- Run `cd ios && pod install` again
- Clean build folder: `cd ios && xcodebuild clean`
- Try `npx react-native-clean-project`

### Android Build Issues
- Clean gradle: `cd android && ./gradlew clean`
- Rebuild: `cd android && ./gradlew assembleDebug`

### Keychain Access Issues
- Ensure biometric/passcode is set up on the device
- Check Info.plist permissions (iOS)
- Verify minimum API level 23 (Android)

## Production Considerations

The app is production-ready with official CDC data integration. Before deploying:

### Ready to Go
1. ✅ **CDC Growth Chart Data**: Automatically fetches official data from CDC.gov
2. ✅ **Smart Caching**: 30-day cache with offline fallback
3. ✅ **Error Handling**: Comprehensive error handling with graceful fallbacks
4. ✅ **Loading States**: Proper loading indicators and user feedback
5. ✅ **Secure Storage**: Platform-level encryption for user data

### Recommended Enhancements
1. **WHO Data Integration**: Implement fetching service similar to CDC (currently uses local sample data)
2. **Data Backup**: Add data export/import functionality
3. **Biometric Fallback**: Handle edge cases where biometrics are unavailable
4. **Testing**: Thoroughly test percentile calculations against official charts
5. **Accessibility**: Add accessibility labels and screen reader support
6. **Internationalization**: Add support for multiple languages and date formats
7. **Analytics**: Add privacy-friendly analytics to track app usage
8. **Manual Refresh**: Allow users to manually refresh CDC data

## License

This is a sample project for demonstration purposes.

## Disclaimer

This app is for informational purposes only. Always consult with healthcare professionals for medical advice regarding child growth and development.
