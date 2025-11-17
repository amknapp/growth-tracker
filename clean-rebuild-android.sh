#!/bin/bash
# Complete clean rebuild script for Android

set -e

echo "🧹 Cleaning Android build artifacts..."
cd android
./gradlew clean
./gradlew cleanBuildCache
rm -rf .gradle
rm -rf app/build
rm -rf build
cd ..

echo "🧹 Cleaning Metro bundler cache..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

echo "🧹 Cleaning React Native cache..."
rm -rf $TMPDIR/react-*

echo "🧹 Cleaning watchman..."
watchman watch-del-all 2>/dev/null || true

echo "✅ Clean complete!"
echo ""
echo "Now run these commands in separate terminals:"
echo "1. Terminal 1: npm start -- --reset-cache"
echo "2. Terminal 2: npm run android"
