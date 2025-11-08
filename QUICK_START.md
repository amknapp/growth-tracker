# Quick Start Guide

## What You Just Got

Your GrowthTracker app now has:

✅ **BSD-3-Clause Open Source License**
✅ **Automated CI/CD with GitHub Actions**
✅ **Google Play Store Release Automation**
✅ **Apple App Store Release Automation**
✅ **Professional README**
✅ **Comprehensive Test Suite (96 passing tests)**

## Publishing Options

Choose one or both:
- **[Google Play Store Setup](#android-google-play-store)** (below)
- **[Apple App Store Setup](IOS_RELEASE_SETUP.md)** (see detailed guide)

---

## Android: Google Play Store

### Android 1. Generate Your Keystore (5 minutes)

```bash
keytool -genkeypair -v \
  -keystore release.keystore \
  -alias growthtracker-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Save these securely:**
- Keystore file (release.keystore)
- Keystore password
- Key alias
- Key password

### Android 2. Convert Keystore to Base64 (1 minute)

```bash
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore")) | Out-File -Encoding ASCII release.keystore.base64

# macOS/Linux
base64 -i release.keystore -o release.keystore.base64
```

### Android 3. Set Up Google Play Console (30 minutes)

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time developer fee (if you haven't already)
3. Create new app: "GrowthTracker"
4. Fill out store listing (you'll need screenshots, icon, description)
5. Complete content rating questionnaire
6. Set up pricing & distribution

### Android 4. Create First Release Manually (15 minutes)

For the **first release only**, you must manually upload:

```bash
cd android
./gradlew bundleRelease
```

Upload `android/app/build/outputs/bundle/release/app-release.aab` to Play Console internal testing track.

### Android 5. Set Up Service Account (20 minutes)

Follow the detailed steps in [RELEASE_SETUP.md](RELEASE_SETUP.md#step-4-set-up-google-cloud-service-account)

You'll get a JSON file - this becomes your `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret.

### Android 6. Configure GitHub Secrets (5 minutes)

Go to: **GitHub Repo > Settings > Secrets and variables > Actions**

Add these 5 secrets:

| Secret Name | Value |
|-------------|-------|
| `RELEASE_KEYSTORE_BASE64` | Content of `release.keystore.base64` file |
| `RELEASE_KEYSTORE_PASSWORD` | Your keystore password |
| `RELEASE_KEY_ALIAS` | Your key alias (e.g., "growthtracker-release") |
| `RELEASE_KEY_PASSWORD` | Your key password |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Full JSON from service account |

### Android 7. Make Your First Automated Release! 🚀

```bash
# Bump to version 1.0.0
npm version 1.0.0

# Push with tags
git push origin mainline --tags
```

GitHub Actions will automatically:
1. ✅ Run all tests
2. ✅ Build signed AAB and APK
3. ✅ Create GitHub release with downloadable APK
4. ✅ Upload to Google Play Store

## Future Releases

After initial setup, releasing is just:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm run version:patch

# For new features (1.0.1 -> 1.1.0)
npm run version:minor

# For breaking changes (1.1.0 -> 2.0.0)
npm run version:major

# Push
git push origin mainline --tags
```

That's it! GitHub Actions handles everything else.

## Monitoring Your Release

1. **GitHub Actions**: Watch the workflow progress
   - Go to: **Actions** tab in your repo
   - Click on the running workflow

2. **Google Play Console**: Check release status
   - Releases typically reviewed in 1-3 days
   - You'll get an email when approved

## Common Issues

### "No such file: release.keystore"
- Make sure you generated the keystore
- Verify `RELEASE_KEYSTORE_BASE64` is set correctly in GitHub Secrets

### "Failed to upload to Play Store"
- Ensure you created the initial release manually first
- Verify service account has correct permissions
- Check that version code is higher than previous release

### "Tests failed"
Run locally first:
```bash
npm test
npm run lint
npx tsc --noEmit
```

## Getting Help

- **Detailed Setup**: See [RELEASE_SETUP.md](RELEASE_SETUP.md)
- **Issues**: Open an issue on GitHub
- **React Native Docs**: https://reactnative.dev/docs/signed-apk-android

## What's Included in the Workflows

### CI Workflow (runs on every PR/commit)
- Installs dependencies
- Runs ESLint
- Runs TypeScript check
- Runs all tests with coverage

### Release Workflow (runs on tags)
- Everything in CI workflow
- Builds signed AAB for Play Store
- Builds signed APK for direct download
- Creates GitHub release
- Uploads to Google Play Store production track

---

**Estimated Total Setup Time**: ~90 minutes (first time)

**Time to Release After Setup**: ~30 seconds + build time (~5-10 minutes)
