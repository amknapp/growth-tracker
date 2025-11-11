# App Store Release Setup Guide

This guide will walk you through setting up automated releases to the Google Play Store (Android) and Apple App Store (iOS) using GitHub Actions.

**📱 This guide assumes you're using Google Play App Signing** (recommended and already enabled for your app). If you're not sure, check Play Console > Setup > App signing.

**⚠️ Note:** The Android app uses bundle ID `com.growthtracker` (already registered in Google Play Store), while iOS uses `com.growthtrackerapp`.

---

# Table of Contents
1. [Android (Google Play Store)](#android-google-play-store)
2. [iOS (Apple App Store)](#ios-apple-app-store)

---

# Android (Google Play Store)

## Prerequisites

1. A Google Play Developer account ($25 one-time fee)
2. An Android **upload key** (for signing AABs before upload - Google manages the app signing key)
3. A Google Cloud project with Play Developer API enabled

## Step 1: Set Up Google Play App Signing (IMPORTANT)

**Google Play App Signing is already enabled for your app.** This means:
- Google manages the **app signing key** (the key that signs APKs users download)
- You only need an **upload key** to sign AABs before uploading to Play Console
- If you lose your upload key, Google can reset it (unlike the app signing key)

### 1.1 Generate an Upload Keystore

If you don't already have an upload keystore, generate one:

```bash
keytool -genkeypair -v \
  -keystore upload.keystore \
  -alias growthtracker-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD
```

**Important:** This is your **upload key**, not your app signing key. Store it securely, but if you lose it, you can request Google to reset it.

Save the following information (you'll need it later):
- Upload keystore password (UPLOAD_KEYSTORE_PASSWORD)
- Key alias (UPLOAD_KEY_ALIAS) - should be "growthtracker-upload" if using the command above
- Key password (UPLOAD_KEY_PASSWORD)

### 1.2 If You Already Have a Keystore

If you already have a keystore that you've been using:
- **If it's the original app signing key:** You can continue using it as your upload key (Google already has the signing key)
- **If you want a separate upload key:** Generate a new one using the command above and register it in Play Console (Setup > App signing > Upload key)

## Step 2: Convert Upload Keystore to Base64

Convert your upload keystore to base64 for GitHub Secrets:

```bash
# On macOS/Linux
base64 -i upload.keystore -o upload.keystore.base64

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("upload.keystore")) | Out-File -Encoding ASCII upload.keystore.base64
```

## Step 3: Set Up Google Play Console

### 3.1 Create Your App
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new application
3. Fill in the required information:
   - App name: **GrowthTracker**
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free

### 3.2 Complete Store Listing
Fill out all required sections:
- App details
- Graphics (screenshots, icon, feature graphic)
- Categorization
- Contact details
- Privacy policy URL (you can host on GitHub Pages)

### 3.3 Verify Play App Signing is Enabled

Since you're using Play App Signing:

1. Go to **Setup > App signing** in Play Console
2. You should see:
   - **App signing key certificate**: Managed by Google Play
   - **Upload key certificate**: Your upload key (or you can register a new one)

### 3.4 Create an Internal Testing Release (First Time)

For your first automated release, you must have created at least one release manually:

1. If you haven't already, build a release AAB locally (signed with your upload key)
2. Upload it to Play Console (Internal Testing or Production track)
3. Complete all required content rating questionnaires
4. Set up pricing & distribution

## Step 4: Set Up Google Cloud Service Account

### 4.1 Enable the Google Play Developer API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Play Android Developer API**
4. Go to **APIs & Services > Credentials**

### 4.2 Create Service Account
1. Click **Create Credentials > Service Account**
2. Name: `github-actions-play-upload`
3. Click **Create and Continue**
4. Grant role: **Service Account User**
5. Click **Done**

### 4.3 Create Service Account Key
1. Click on the newly created service account
2. Go to **Keys** tab
3. Click **Add Key > Create new key**
4. Choose **JSON** format
5. Download the JSON file - this is your `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### 4.4 Grant Access in Play Console
1. Go back to [Google Play Console](https://play.google.com/console)
2. Go to **Setup > API access**
3. Link your Google Cloud project if not already linked
4. Under **Service accounts**, find your service account
5. Click **Grant access**
6. Under **App permissions**, select your app
7. Under **Account permissions**, grant:
   - View app information and download bulk reports
   - Manage production releases
   - Manage testing track releases
8. Click **Invite user** and then **Apply**

## Step 5: Configure GitHub Secrets

Go to your GitHub repository settings (Settings > Secrets and variables > Actions) and add these secrets:

### Required Secrets:

**⚠️ IMPORTANT:** Since you're using Google Play App Signing, these secrets are for your **upload key**, not the app signing key.

1. **RELEASE_KEYSTORE_BASE64**
   - The base64-encoded content of your **upload.keystore** file
   - Paste the entire content from `upload.keystore.base64`

2. **RELEASE_KEYSTORE_PASSWORD**
   - Your **upload keystore** password

3. **RELEASE_KEY_ALIAS**
   - Your **upload key** alias (e.g., "growthtracker-upload")

4. **RELEASE_KEY_PASSWORD**
   - Your **upload key** password

5. **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON**
   - The entire JSON content from your service account key file
   - Paste the complete JSON object (including curly braces)

## Step 6: Update package.json Version

Add version bumping scripts to your `package.json`:

```json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}
```

## Step 7: Create a Release

### Option A: Using Git Tags (Recommended)

1. Update version and create tag:
   ```bash
   npm version patch  # or minor, or major
   git push origin mainline --tags
   ```

2. The GitHub Action will automatically:
   - Run tests and linting
   - Build the AAB and APK
   - Create a GitHub release
   - Upload to Google Play Store production track

### Option B: Manual Trigger

1. Go to your repository on GitHub
2. Click **Actions** > **Android Release Build**
3. Click **Run workflow**
4. Enter version name (e.g., "1.0.1") and version code (e.g., 101)
5. Click **Run workflow**

## Step 8: Monitor the Release

1. **GitHub Actions**: Check the workflow run to ensure build succeeded
2. **Google Play Console**:
   - Go to **Production** track
   - Your release should appear in "Under review" status
   - Google typically reviews apps within 1-3 days

## Version Naming Convention

- **Version Name**: Semantic versioning (e.g., 1.0.0, 1.2.3)
- **Version Code**: Integer that increases with each release
  - Recommended: Concatenate version numbers (1.0.3 → 103, 1.2.15 → 1215)

## Troubleshooting

### Build Fails with "Keystore not found"
- Verify RELEASE_KEYSTORE_BASE64 is correctly set in GitHub Secrets
- Make sure there are no extra newlines or spaces in the base64 string

### Upload to Play Store Fails
- Ensure your service account has the correct permissions
- Verify you've already created an initial release manually
- Check that the package name matches exactly: `com.growthtracker`

### Version Code Conflict
- Each upload must have a higher version code than the previous
- Never reuse a version code, even for internal testing

## App Signing by Google Play (ALREADY ENABLED ✓)

**Your app is already using Google Play App Signing!** Benefits:
- ✓ Google stores your app signing key securely
- ✓ You use a separate upload key (easier to manage)
- ✓ If you lose your upload key, you can request Google to reset it
- ✓ Users always get APKs signed with the same app signing key
- ✓ Optimized APK delivery

### Upload Key Management

If you need to change your upload key:
1. Go to Play Console > Setup > App signing
2. Click "Request upload key reset"
3. Follow Google's instructions to generate and register a new upload key
4. Update your GitHub secrets with the new upload key

## Privacy Policy Hosting

You need to provide a privacy policy URL. Options:

### Option 1: GitHub Pages
1. Create `docs/privacy-policy.md` in your repo
2. Enable GitHub Pages in repository settings
3. URL: `https://[username].github.io/[repo]/privacy-policy.html`

### Option 2: Use the app content
Host a simple HTML version of your privacy policy on any web server.

## Additional Resources

- [React Native Release Docs](https://reactnative.dev/docs/signed-apk-android)
- [Google Play Publishing Guide](https://developer.android.com/studio/publish)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

# iOS (Apple App Store)

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Enroll at [https://developer.apple.com/programs/](https://developer.apple.com/programs/)
2. **Mac computer** (required for creating certificates and building iOS apps)
3. **Xcode** installed (from Mac App Store)
4. **App ID registered** for `com.growthtrackerapp`

## Step 1: Create App Store Connect API Key

This allows GitHub Actions to upload builds without your Apple ID password.

### 1.1 Generate API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click your name (top right) > **Keys** (under **Integrations**)
3. Click **App Store Connect API** > **Team Keys**
4. Click the **+** button to create a new key
5. Enter a name: `GitHub Actions CI/CD`
6. Set Access: **App Manager** (or **Admin** for full access)
7. Click **Generate**
8. **Download the .p8 file** - you can only download it once!
9. Note the **Key ID** and **Issuer ID** (you'll need these)

### 1.2 Convert API Key to Base64

```bash
# On macOS/Linux
base64 -i AuthKey_XXXXXXXXXX.p8 -o authkey.base64

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXXXXXX.p8")) | Out-File -Encoding ASCII authkey.base64
```

## Step 2: Create Signing Certificate

### 2.1 Generate Certificate Signing Request (CSR)

On your Mac:

1. Open **Keychain Access** (Applications > Utilities > Keychain Access)
2. Menu: **Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority**
3. Fill in:
   - **User Email Address**: Your Apple ID email
   - **Common Name**: Your name or "GrowthTracker iOS Distribution"
   - **CA Email Address**: Leave empty
   - Select **Saved to disk**
4. Click **Continue** and save the `CertificateSigningRequest.certSigningRequest` file

### 2.2 Create Distribution Certificate

1. Go to [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click the **+** button
3. Select **Apple Distribution** (for App Store distribution)
4. Click **Continue**
5. Upload the CSR file you created
6. Click **Continue** and then **Download**
7. Double-click the downloaded `.cer` file to install it in Keychain Access

### 2.3 Export Certificate as P12

1. Open **Keychain Access**
2. In the left sidebar, select **My Certificates**
3. Find your "Apple Distribution" certificate
4. **Right-click** the certificate and select **Export "Apple Distribution..."**
5. Save as: `distribution.p12`
6. **Set a password** (you'll need this for GitHub Secrets)
7. Click **Save**

### 2.4 Convert P12 to Base64

```bash
# On macOS/Linux
base64 -i distribution.p12 -o distribution.p12.base64

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("distribution.p12")) | Out-File -Encoding ASCII distribution.p12.base64
```

## Step 3: Create Provisioning Profile

### 3.1 Register App ID (if not already done)

1. Go to [Apple Developer Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click the **+** button
3. Select **App IDs** > **Continue**
4. Select **App** > **Continue**
5. Fill in:
   - **Description**: GrowthTracker
   - **Bundle ID**: Explicit - `com.growthtrackerapp`
6. Under **Capabilities**, enable any needed capabilities (e.g., Push Notifications, HealthKit if needed)
7. Click **Continue** and **Register**

### 3.2 Create App Store Provisioning Profile

1. Go to [Apple Developer Profiles](https://developer.apple.com/account/resources/profiles/list)
2. Click the **+** button
3. Select **App Store** (under Distribution)
4. Click **Continue**
5. Select your App ID: `com.growthtrackerapp`
6. Click **Continue**
7. Select your **Apple Distribution** certificate
8. Click **Continue**
9. Profile Name: `GrowthTracker App Store`
10. Click **Generate**
11. **Download** the `.mobileprovision` file

### 3.3 Convert Provisioning Profile to Base64

```bash
# On macOS/Linux
base64 -i GrowthTracker_App_Store.mobileprovision -o profile.mobileprovision.base64

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("GrowthTracker_App_Store.mobileprovision")) | Out-File -Encoding ASCII profile.mobileprovision.base64
```

## Step 4: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** > **+** (plus button) > **New App**
3. Fill in:
   - **Platforms**: iOS
   - **Name**: GrowthTracker
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.growthtrackerapp`
   - **SKU**: `growthtracker-ios` (unique identifier for your records)
   - **User Access**: Full Access
4. Click **Create**

### 4.1 Complete App Information

Fill out all required sections:
- **App Information**: Category, content rights, age rating
- **Pricing and Availability**: Select countries and pricing tier (Free)
- **App Privacy**: Privacy policy URL, data collection details
- **App Screenshots**: Upload screenshots for required device sizes
- **App Description**: Write compelling description
- **Keywords**: Relevant search keywords
- **Support URL**: Your support website or GitHub repo
- **Marketing URL** (optional)

## Step 5: Configure GitHub Secrets

Go to your GitHub repository settings (Settings > Secrets and variables > Actions) and add these secrets:

### Required iOS Secrets:

1. **IOS_SIGNING_CERTIFICATE_P12_BASE64**
   - The base64-encoded content of your `distribution.p12` file
   - Paste the entire content from `distribution.p12.base64`

2. **IOS_SIGNING_CERTIFICATE_PASSWORD**
   - The password you set when exporting the P12 certificate

3. **IOS_PROVISIONING_PROFILE_BASE64**
   - The base64-encoded content of your `.mobileprovision` file
   - Paste the entire content from `profile.mobileprovision.base64`

4. **IOS_PROVISIONING_PROFILE_NAME**
   - The exact name of your provisioning profile (e.g., "GrowthTracker App Store")
   - You can find this by opening the `.mobileprovision` file in a text editor and searching for `<key>Name</key>`

5. **IOS_TEAM_ID**
   - Your Apple Developer Team ID (10-character string)
   - Find it at [https://developer.apple.com/account](https://developer.apple.com/account) (Membership section)

6. **APP_STORE_CONNECT_API_KEY_ID**
   - The Key ID from Step 1.1 (e.g., "ABC123DEFG")

7. **APP_STORE_CONNECT_ISSUER_ID**
   - The Issuer ID from Step 1.1 (UUID format)

8. **APP_STORE_CONNECT_API_KEY_CONTENT**
   - The base64-encoded content of your `.p8` API key file
   - Paste the entire content from `authkey.base64`

## Step 6: Update Android Secrets (If Not Already Done)

Make sure these Android secrets are also set:

1. **RELEASE_KEYSTORE_BASE64**
   ```bash
   cat android/app/upload.keystore.base64.new
   ```
   Copy the entire output and paste into GitHub secret

2. **RELEASE_KEYSTORE_PASSWORD**: `$h4il2m3*`
3. **RELEASE_KEY_ALIAS**: `growthtracker-upload`
4. **RELEASE_KEY_PASSWORD**: `$h4il2m3*`

## Step 7: Create a Release

### Option A: Using Git Tags (Recommended)

1. Commit all changes and ensure tests pass
2. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. GitHub Actions will automatically:
   - Build both Android (AAB/APK) and iOS (IPA)
   - Create a GitHub release with artifacts
   - Upload Android AAB to Google Play Store
   - Upload iOS IPA to App Store Connect

### Option B: Manual Trigger

#### For iOS:
1. Go to **Actions** > **iOS Release Build**
2. Click **Run workflow**
3. Enter version name (e.g., "1.0.0") and build number (e.g., "1")
4. Click **Run workflow**

#### For Android:
1. Go to **Actions** > **Android Release Build**
2. Click **Run workflow**
3. Enter version name (e.g., "1.0.0") and version code (e.g., "100")
4. Click **Run workflow**

## Step 8: Monitor the Release

### iOS:
1. **GitHub Actions**: Check workflow logs for build status
2. **App Store Connect**:
   - Go to **My Apps** > **GrowthTracker** > **TestFlight**
   - Your build should appear under **iOS Builds** (processing takes 5-15 minutes)
   - Once processed, you can submit to **App Store Review**
   - Go to **App Store** tab > **+ Version or Platform** > create version
   - Select your build and submit for review

### Android:
1. **GitHub Actions**: Check workflow logs
2. **Google Play Console**:
   - Go to **Production** or **Testing** track
   - Review should complete in 1-3 days

## Troubleshooting

### iOS Build Fails with "No Provisioning Profiles Found"
- Verify `IOS_PROVISIONING_PROFILE_BASE64` is correctly set
- Ensure the profile matches your bundle ID (`com.growthtrackerapp`)
- Check that the profile hasn't expired

### iOS Build Fails with "No Signing Certificate Found"
- Verify `IOS_SIGNING_CERTIFICATE_P12_BASE64` is correctly set
- Check `IOS_SIGNING_CERTIFICATE_PASSWORD` is correct
- Ensure the certificate hasn't expired

### iOS Upload Fails
- Verify App Store Connect API credentials are correct
- Ensure your app is created in App Store Connect
- Check that the bundle ID matches exactly

### Android Keystore Decoding Fails
- Use `upload.keystore.base64.new` file (generated with proper encoding)
- Ensure no extra whitespace in the GitHub secret
- Verify the password doesn't have shell-escaping issues

### Version Conflicts
- iOS: Each build number must be unique and incrementing
- Android: Each version code must be higher than the previous

## iOS Version Management

- **CFBundleShortVersionString** (Version): Marketing version (e.g., "1.0.0")
- **CFBundleVersion** (Build): Must be incrementing integer or string (e.g., "1", "2", "3")
- Each TestFlight/App Store upload must have a unique build number

## Additional iOS Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Xcode Cloud vs GitHub Actions](https://developer.apple.com/xcode-cloud/)
