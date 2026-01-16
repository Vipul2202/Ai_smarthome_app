#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏠 Smart Home App - Local APK Builder');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Check if Expo CLI is installed
try {
  execSync('npx expo --version', { stdio: 'pipe' });
  console.log('✅ Expo CLI is available');
} catch (error) {
  console.log('📦 Installing Expo CLI...');
  try {
    execSync('npm install -g @expo/cli', { stdio: 'inherit' });
    console.log('✅ Expo CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Expo CLI:', installError.message);
    process.exit(1);
  }
}

// Create build directory
const buildDir = path.join(process.cwd(), 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

console.log('\n🔨 Building APK locally...');
console.log('This will create a development build that you can install directly.\n');

try {
  // Export the app
  console.log('📦 Exporting app...');
  execSync('npx expo export --platform android', { stdio: 'inherit' });
  
  console.log('\n✅ Export completed!');
  console.log('\n📱 To create an installable APK:');
  console.log('1. Use Android Studio to build the APK from the exported files');
  console.log('2. Or use EAS Build for a complete APK: eas build --platform android');
  console.log('\n💡 For the easiest APK generation, use EAS Build:');
  console.log('   - Login: eas login');
  console.log('   - Build: eas build --platform android --profile preview');
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.log('\n🔍 Troubleshooting:');
  console.log('1. Make sure all dependencies are installed: npm install');
  console.log('2. Check that your app.json configuration is correct');
  console.log('3. For full APK builds, use EAS Build instead');
}