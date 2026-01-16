# 📱 Smart Home App - APK Build Guide

## Method 1: EAS Build (Recommended)

### Prerequisites
- Expo account (create at https://expo.dev)
- EAS CLI installed (already done ✅)

### Steps
1. **Login to Expo**
   ```bash
   cd smart-home-frontend
   eas login
   ```
   Enter your email and password when prompted.

2. **Build APK**
   ```bash
   # Using the custom build script
   node build-apk.js
   
   # OR directly with EAS
   eas build --platform android --profile preview
   ```

3. **Download APK**
   - EAS will provide a download link when build completes
   - Build typically takes 10-15 minutes
   - You'll receive an email notification when ready

### Build Profiles Available
- `development`: Development build with debugging
- `preview`: Production-like build for testing (generates APK)
- `production`: Store-ready build (generates AAB)

## Method 2: Local Export (Development Only)

If you want to test locally without EAS:

```bash
# Run the local build script
node scripts/build-local-apk.js

# OR manually export
npx expo export --platform android
```

**Note**: This creates exported files but not a complete APK. For installable APKs, use EAS Build.

## Troubleshooting

### Common Issues
1. **Not logged in**: Run `eas login`
2. **No build credits**: Free accounts get limited builds per month
3. **Build fails**: Check app.json configuration and dependencies

### Build Status
Check your builds at: https://expo.dev/accounts/[your-username]/projects/smart-home-app/builds

### App Configuration
- **Package Name**: com.smarthome.app
- **Version**: 1.0.0
- **Permissions**: Camera, Audio, Storage
- **Target**: Android API level compatible with Expo SDK 54

## Installation
1. Download the APK from EAS build link
2. Enable "Install from unknown sources" on your Android device
3. Install the APK
4. Make sure your backend server is running
5. Test the app functionality

## Next Steps After APK Generation
1. Test on multiple Android devices
2. Verify all features work (camera, voice, inventory)
3. Check network connectivity to your backend
4. Consider publishing to Google Play Store (use production build)