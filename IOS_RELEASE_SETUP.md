# iOS App Store Release Setup Guide

This guide will walk you through setting up automated releases to the Apple App Store using GitHub Actions.

**⚠️ Note:** The iOS app uses bundle ID `com.growthtrackerapp`, while Android uses `com.growthtracker` (already registered in Google Play Store).

## Prerequisites

1. **Apple Developer Account** ($99/year subscription)
2. **macOS** for initial certificate setup (or access to a Mac)
3. **Xcode** installed (download from Mac App Store)

## Overview

The iOS release process involves:
- **Code signing certificates** (to prove you're the developer)
- **Provisioning profiles** (to authorize your app to run on devices)
- **App Store Connect** (Apple's app submission portal)
- **API keys** (for automated uploads)

## Step 1: Join Apple Developer Program (30 minutes)

1. Go to [Apple Developer](https://developer.apple.com/programs/)
2. Enroll in the Apple Developer Program ($99/year)
3. Wait for enrollment approval (usually within 24 hours)

## Step 2: Create App ID (5 minutes)

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** > **+** button
4. Select **App IDs** > **Continue**
5. Configure:
   - **Description**: GrowthTracker
   - **Bundle ID**: `com.growthtrackerapp` (must match your app)
   - **Capabilities**: Enable any needed capabilities (e.g., Push Notifications if needed)
6. Click **Continue** > **Register**

## Step 3: Create Distribution Certificate (10 minutes)

### 3.1 Generate Certificate Signing Request (CSR)

On your Mac:

1. Open **Keychain Access** (Applications > Utilities > Keychain Access)
2. Menu: **Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority**
3. Fill in:
   - **User Email Address**: Your email
   - **Common Name**: Your name
   - **CA Email Address**: Leave empty
   - **Request is**: Saved to disk
4. Click **Continue** and save the CSR file

### 3.2 Create Certificate in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles > Certificates**
3. Click **+** button
4. Select **Apple Distribution** > **Continue**
5. Upload your CSR file
6. Download the certificate (`.cer` file)

### 3.3 Import Certificate to Keychain

1. Double-click the downloaded `.cer` file to add it to Keychain
2. Find it in **Keychain Access** under **My Certificates**
3. It should show "Apple Distribution: Your Name (Team ID)"

### 3.4 Export Certificate as P12

1. In Keychain Access, find your distribution certificate
2. Right-click > **Export "Apple Distribution: ..."**
3. Save as: `distribution.p12`
4. **Set a strong password** (you'll need this for GitHub Secrets)
5. Save this file securely!

### 3.5 Convert P12 to Base64

```bash
# macOS/Linux
base64 -i distribution.p12 -o distribution.p12.base64

# Verify it worked
cat distribution.p12.base64
```

Save the following for later:
- `distribution.p12.base64` file content → `IOS_SIGNING_CERTIFICATE_P12_BASE64`
- The password you set → `IOS_SIGNING_CERTIFICATE_PASSWORD`

## Step 4: Create Provisioning Profile (10 minutes)

### 4.1 Create App Store Provisioning Profile

1. Go to **Certificates, Identifiers & Profiles > Profiles**
2. Click **+** button
3. Select **App Store** > **Continue**
4. Select **App ID**: `com.growthtrackerapp` > **Continue**
5. Select your **Distribution Certificate** > **Continue**
6. **Profile Name**: GrowthTracker App Store
7. Click **Generate**
8. Download the profile (`.mobileprovision` file)

### 4.2 Convert Provisioning Profile to Base64

```bash
# macOS/Linux
base64 -i GrowthTracker_App_Store.mobileprovision -o provisioning.base64

# Verify
cat provisioning.base64
```

Save for later:
- `provisioning.base64` file content → `IOS_PROVISIONING_PROFILE_BASE64`
- Profile name (e.g., "GrowthTracker App Store") → `IOS_PROVISIONING_PROFILE_NAME`

## Step 5: Get Your Team ID (2 minutes)

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Click on **Membership** in the sidebar
3. Find your **Team ID** (10-character string like `AB12CD34EF`)
4. Save this → `IOS_TEAM_ID`

## Step 6: Create App in App Store Connect (20 minutes)

### 6.1 Create App

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** > **+** > **New App**
3. Fill in:
   - **Platforms**: iOS
   - **Name**: GrowthTracker
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.growthtrackerapp`
   - **SKU**: `growthtracker` (unique identifier for your records)
   - **User Access**: Full Access
4. Click **Create**

### 6.2 Complete App Information

Fill out all required sections:

**App Information:**
- Category: Medical (or Health & Fitness)
- Content Rights: Own or licensed all rights

**Pricing and Availability:**
- Price: Free
- Availability: All countries (or select specific ones)

**App Privacy:**
- Privacy Policy URL: (you'll need to host this - see options below)
- Data Collection: "No, we do not collect data from this app"

**Screenshots and Description:**
You'll need screenshots for required device sizes:
- 6.7" display (iPhone 14 Pro Max, iPhone 15 Pro Max)
- 6.5" display (iPhone 11 Pro Max, iPhone XS Max)
- Or use App Store Connect's new simplified screenshot requirements

## Step 7: Create App Store Connect API Key (10 minutes)

This is what allows GitHub Actions to upload builds automatically.

### 7.1 Create API Key

1. In App Store Connect, click your name (top right) > **Users and Access**
2. Go to **Integrations** tab > **App Store Connect API**
3. Click **+** (Generate API Key)
4. Fill in:
   - **Name**: GitHub Actions
   - **Access**: App Manager (or Admin)
5. Click **Generate**

### 7.2 Download and Save API Key

1. **Download** the API Key (`.p8` file) - **You can only download this ONCE!**
2. Note the **Key ID** (e.g., `ABC123XYZ4`)
3. Note the **Issuer ID** (UUID at top of page)

### 7.3 Convert API Key to Base64

```bash
# macOS/Linux
base64 -i AuthKey_ABC123XYZ4.p8 -o apikey.base64

# Verify
cat apikey.base64
```

Save for GitHub Secrets:
- Key ID → `APP_STORE_CONNECT_API_KEY_ID`
- Issuer ID → `APP_STORE_CONNECT_ISSUER_ID`
- Base64 content → `APP_STORE_CONNECT_API_KEY_CONTENT`

## Step 8: Configure GitHub Secrets (5 minutes)

Go to: **GitHub Repo > Settings > Secrets and variables > Actions**

Add these secrets:

| Secret Name | Value | How to Get It |
|-------------|-------|---------------|
| `IOS_SIGNING_CERTIFICATE_P12_BASE64` | Base64 of distribution.p12 | Step 3.5 |
| `IOS_SIGNING_CERTIFICATE_PASSWORD` | P12 password | Step 3.4 |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64 of .mobileprovision | Step 4.2 |
| `IOS_PROVISIONING_PROFILE_NAME` | Profile name | Step 4.1 (e.g., "GrowthTracker App Store") |
| `IOS_TEAM_ID` | 10-char team ID | Step 5 |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID | Step 7.2 |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID (UUID) | Step 7.2 |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | Base64 of .p8 file | Step 7.3 |

## Step 9: Update iOS Project Info.plist (5 minutes)

The workflow needs to update version numbers in `ios/GrowthTracker/Info.plist`. Verify these keys exist:

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

These should already exist in a React Native project, but double-check.

## Step 10: Create First Build Manually (Optional but Recommended)

For your first submission, it's recommended to build locally to ensure everything works:

```bash
# Open Xcode
cd ios
open GrowthTracker.xcworkspace

# In Xcode:
# 1. Select "Any iOS Device (arm64)" as destination
# 2. Product > Archive
# 3. Window > Organizer > Distribute App
# 4. App Store Connect > Upload
# 5. Follow prompts
```

This helps catch any configuration issues before automating.

## Step 11: Make Your First Automated Release! 🚀

```bash
# Bump to version 1.0.0
npm version 1.0.0

# Push with tags
git push origin mainline --tags
```

GitHub Actions will:
1. ✅ Run tests and linting
2. ✅ Install CocoaPods dependencies
3. ✅ Import signing certificate
4. ✅ Build and archive the app
5. ✅ Export IPA
6. ✅ Upload to App Store Connect
7. ✅ Create GitHub release

## Step 12: Submit for Review

After the workflow completes:

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app > **TestFlight** or **App Store**
3. The build will appear under "Builds" (may take 5-10 minutes to process)
4. Once processed:
   - **For TestFlight**: Add internal/external testers
   - **For App Store**: Fill out "Version Information" and click **Submit for Review**

## Version Numbering

**CFBundleShortVersionString** (Version):
- User-facing version: `1.0.0`, `1.2.3`
- Uses semantic versioning

**CFBundleVersion** (Build Number):
- Must be unique and incrementing: `1`, `2`, `3`, `100`, `101`
- Or use version without dots: `1.0.3` → `103`

## Future Releases

```bash
# Patch release (1.0.0 -> 1.0.1)
npm run version:patch

# Minor release (1.0.1 -> 1.1.0)
npm run version:minor

# Major release (1.1.0 -> 2.0.0)
npm run version:major

# Push
git push origin mainline --tags
```

## Hosting Your Privacy Policy

You need a public URL for your privacy policy:

### Option 1: GitHub Pages (Free)

1. Create `docs/privacy-policy.html` in your repo
2. Go to **Repo Settings > Pages**
3. Source: Deploy from branch `mainline`, folder `/docs`
4. URL will be: `https://[username].github.io/[repo]/privacy-policy.html`

### Option 2: Simple Static Site

Host on Netlify, Vercel, or any web hosting service.

## Troubleshooting

### "Code signing error: No signing certificate"
- Verify `IOS_SIGNING_CERTIFICATE_P12_BASE64` is correct
- Check certificate password is correct
- Ensure certificate hasn't expired

### "No matching provisioning profile found"
- Verify bundle ID matches: `com.growthtrackerapp`
- Check provisioning profile includes your distribution certificate
- Ensure profile name in secret matches actual profile name

### "Invalid API Key"
- Verify all three API key secrets are correct
- Ensure API key has sufficient permissions (App Manager or Admin)
- Check Issuer ID is the UUID, not Team ID

### Build fails on CocoaPods
```bash
# Run locally to debug
cd ios
pod install --repo-update
```

### Archive succeeds but upload fails
- Check App Store Connect API key permissions
- Verify team ID is correct
- Ensure bundle ID matches exactly

## App Review Guidelines

Apple reviews all apps. Common rejection reasons:

1. **Incomplete Information**: Fill out all required metadata
2. **Privacy Policy**: Must be accessible and accurate
3. **Screenshots**: Must show actual app functionality
4. **Age Ratings**: Fill out questionnaire accurately
5. **Test Account**: Provide if app requires login (GrowthTracker doesn't)

## TestFlight Beta Testing

Before public release, test with TestFlight:

1. Upload build (GitHub Actions does this)
2. Add internal testers (up to 100, instant access)
3. Add external testers (up to 10,000, Apple reviews)
4. Collect feedback
5. Fix issues
6. Submit to App Store when ready

## Review Timeline

- **TestFlight**: Internal - Instant, External - 24-48 hours
- **App Store**: First submission - 1-7 days, Updates - 24-48 hours

## Certificate Expiration

Distribution certificates expire after **1 year**. Before expiration:

1. Generate new certificate (Step 3)
2. Create new provisioning profile with new certificate (Step 4)
3. Update GitHub Secrets with new base64 values
4. Old builds remain valid

## Costs

- **Apple Developer Program**: $99/year (required)
- **GitHub Actions**: Free for public repos, included minutes for private repos
- **Hosting**: Free (GitHub Pages) or minimal cost

## Security Best Practices

1. **Never commit** certificates, profiles, or API keys to git
2. **Use GitHub Secrets** for all sensitive data
3. **Rotate API keys** annually
4. **Limit API key scope** to only what's needed
5. **Enable 2FA** on Apple ID

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs for specific errors
3. Search Apple Developer Forums
4. Open an issue on GitHub

---

**Estimated Total Setup Time**: ~2 hours (first time)

**Time to Release After Setup**: ~30 seconds + build time (~10-15 minutes)

**App Store Review**: 1-7 days (first submission), 24-48 hours (updates)
