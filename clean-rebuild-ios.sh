#!/bin/bash
# Complete clean rebuild script for iOS

set -e

echo "🧹 Cleaning iOS build artifacts..."
cd ios
rm -rf build
rm -rf Pods
rm -rf Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
cd ..

echo "🧹 Cleaning Metro bundler cache..."
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

echo "🧹 Cleaning React Native cache..."
rm -rf $TMPDIR/react-*

echo "🧹 Cleaning watchman..."
watchman watch-del-all 2>/dev/null || true

echo "📦 Reinstalling iOS pods..."
cd ios
pod install
cd ..

echo "✅ Clean complete!"
echo ""
echo "Now run these commands in separate terminals:"
echo "1. Terminal 1: npm start -- --reset-cache"
echo "2. Terminal 2: npm run ios"
