# GrowthTracker

A privacy-focused React Native app for tracking children's growth and development using CDC and WHO growth charts.

![CI](https://github.com/amknapp/growth-tracker/workflows/CI/badge.svg)
[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## Features

- 📊 **Growth Charts**: Track weight, height, and head circumference using official CDC and WHO standards
- 🔒 **Privacy-First**: All data stored locally with device-level encryption (Keychain/Keystore)
- 📱 **Offline-First**: Works completely offline, no internet required
- 📈 **Percentile Tracking**: Visualize your child's growth against population percentiles
- 🌐 **Multiple Children**: Track multiple children with individual profiles
- 📝 **Measurement History**: Record and view historical measurements
- 🔐 **Secure Storage**: AES-256 encryption on iOS, hardware-backed encryption on Android
- 🚫 **Zero Data Collection**: No servers, no analytics, no tracking

## Privacy

GrowthTracker is designed with privacy as a core principle:

- **No servers**: We don't operate any servers
- **No analytics**: We don't track usage
- **No third-party services**: Your data stays on your device
- **No accounts**: No registration required
- **Works offline**: No internet connection needed

See our [Privacy Policy](src/content/privacyPolicy.ts) for full details.

## Installation

### App Stores
- **Google Play Store**: Coming soon!
- **Apple App Store**: Coming soon!

### Build from Source

#### Prerequisites
- Node.js 20+
- React Native development environment ([setup guide](https://reactnative.dev/docs/environment-setup))
- For Android: Android Studio, Java 17
- For iOS: Xcode, CocoaPods (macOS only)

#### Steps

```bash
# Clone the repository
git clone https://github.com/amknapp/growth-tracker.git
cd growth-tracker

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linter
npm run lint

# Run TypeScript check
npx tsc --noEmit
```

### Project Structure

```
src/
├── components/       # Reusable UI components
├── content/          # Static content (privacy policy, etc.)
├── navigators/       # Navigation configuration
├── screens/          # Screen components
├── services/         # Business logic and data services
│   ├── CDCDataService.ts      # Growth chart data fetching
│   └── SecureStorage.ts       # Encrypted local storage
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
    ├── ageCalculator.ts       # Age calculation helpers
    └── percentileCalculator.ts # Growth percentile calculations
```

### Technology Stack

- **React Native 0.81** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **Victory Native** - Charts and visualizations
- **React Native Keychain** - Secure storage
- **AsyncStorage** - Local data persistence
- **Jest** - Testing framework
- **ESLint** - Code linting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Quality

- All tests must pass
- Code must pass ESLint checks
- TypeScript must compile without errors
- Maintain test coverage above 80%

## Release Process

Automated releases to both Google Play Store and Apple App Store:

- **Android**: See [RELEASE_SETUP.md](RELEASE_SETUP.md) for Google Play Store setup
- **iOS**: See [IOS_RELEASE_SETUP.md](IOS_RELEASE_SETUP.md) for App Store setup

Quick release:
```bash
# Bump version and create tag
npm run version:patch  # or version:minor, version:major

# Push with tags
git push origin mainline --tags

# GitHub Actions will automatically:
# - Build Android AAB/APK and upload to Google Play
# - Build iOS IPA and upload to App Store Connect
```

## License

This project is licensed under the BSD 3-Clause License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Growth chart data provided by the [Centers for Disease Control and Prevention (CDC)](https://www.cdc.gov/growthcharts/)
- WHO growth standards from the [World Health Organization](https://www.who.int/tools/child-growth-standards)

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/amknapp/growth-tracker/issues) on GitHub.

## Disclaimer

This app is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider regarding your child's growth and development.
