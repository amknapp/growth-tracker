# Fix EventEmitter Error on iOS and Android

## Problem

After merging the custom avatar feature PR (#41fd094), the app crashed on both iOS and Android with:
```
TypeError: Cannot read property 'EventEmitter' of undefined
```

## Root Cause

The custom avatar feature added `expo-image-picker` as a dependency. This package requires the Expo modules infrastructure (`expo-modules-core`) to be properly configured in the native code. Since this is a **bare React Native app** without Expo modules setup, the EventEmitter provided by expo-modules-core was undefined at runtime, causing the crash.

## Solution

Replaced `expo-image-picker` with `react-native-image-picker`, which is designed specifically for bare React Native apps and has no Expo dependencies.

## Changes

### Core Fix
- **Replaced expo-image-picker with react-native-image-picker v8.2.1**
  - Removed expo-image-picker and all Expo infrastructure (240 packages removed)
  - Added react-native-image-picker with better new architecture support
  - Updated `AddChildScreen.tsx` to use new API (`launchCamera`, `launchImageLibrary`)
  - Updated Jest mocks for the new library

### Permissions
- **Android (AndroidManifest.xml):**
  - Added CAMERA permission
  - Added READ_EXTERNAL_STORAGE (API < 33)
  - Added WRITE_EXTERNAL_STORAGE (API < 33)
  - Added READ_MEDIA_IMAGES (API 33+)
  - Implemented runtime camera permission request using PermissionsAndroid

- **iOS (Info.plist):**
  - Added NSPhotoLibraryUsageDescription
  - Added NSCameraUsageDescription

### Additional Improvements
- Added ProGuard rules for react-native-reanimated (good practice for release builds)
- Added cleanup scripts for rebuilding (`clean-rebuild-android.sh`, `clean-rebuild-ios.sh`)

## Impact

### Dependency Reduction
- ❌ Removed: 240 packages (entire Expo infrastructure)
- ✅ Added: 1 package (react-native-image-picker)
- 📉 Total: **-3,725 lines in package-lock.json**

### Functionality
- ✅ EventEmitter error completely resolved on both platforms
- ✅ Avatar picker works on iOS and Android
- ✅ Camera and photo library access work correctly
- ✅ Proper permission handling on both platforms

## Testing

### Android
1. Install dependencies: `npm install`
2. Clean build: `cd android && ./gradlew clean && cd ..`
3. Start Metro: `npm start -- --reset-cache`
4. Run app: `npm run android`
5. Test: Add a child → Click avatar → Try both "Take Photo" and "Choose from Gallery"

### iOS
1. Install dependencies: `npm install`
2. Install pods: `cd ios && pod install && cd ..`
3. Start Metro: `npm start -- --reset-cache`
4. Run app: `npm run ios`
5. Test: Add a child → Click avatar → Try both "Take Photo" and "Choose from Gallery"

## Screenshots

_[Add screenshots showing the avatar picker working]_

## Fixes

Fixes: `TypeError: Cannot read property 'EventEmitter' of undefined`

## Related PRs

- Custom avatar feature: #41fd094
