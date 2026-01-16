#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏠 Smart Home App - APK Builder');
console.log('================================\n');

// Check if EAS CLI is installed
try {
  execSync('eas --version', { stdio: 'pipe' });
  console.log('✅ EAS CLI is installed');
} catch (error) {
  console.log('📦 Installing EAS CLI...');
  try {
    execSync('npm install -g eas-cli', { stdio: 'inherit' });
    console.log('✅ EAS CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install EAS CLI:', installError.message);
    console.log('💡 Please install manually: npm install -g eas-cli');
    process.exit(1);
  }
}

// Check if user is logged in
console.log('\n🔐 Checking authentication...');
try {
  execSync('eas whoami', { stdio: 'pipe' });
  console.log('✅ Already logged in to EAS');
} catch (error) {
  console.log('🔑 Please log in to your Expo account:');
  console.log('Run: eas login');
  console.log('If you don\'t have an account, create one at: https://expo.dev');
  process.exit(1);
}

// Configure EAS if not already configured
if (!fs.existsSync('eas.json')) {
  console.log('\n⚙️ Configuring EAS build...');
  try {
    execSync('eas build:configure', { stdio: 'inherit' });
    console.log('✅ EAS build configured');
  } catch (error) {
    console.error('❌ Failed to configure EAS build:', error.message);
    process.exit(1);
  }
}

// Build APK
console.log('\n🔨 Building Android APK...');
console.log('This may take 10-15 minutes...\n');

try {
  execSync('eas build --platform android --profile development', { stdio: 'inherit' });
  console.log('\n🎉 APK build completed successfully!');
  console.log('\n📱 Next steps:');
  console.log('1. Download the APK from the link provided above');
  console.log('2. Install it on your Android device');
  console.log('3. Make sure your backend server is running');
  console.log('4. Test the app functionality');
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('1. Make sure you\'re logged in: eas login');
  console.log('2. Check your internet connection');
  console.log('3. Verify your Expo account has build credits');
  console.log('4. Try building again: eas build --platform android --profile development');
}