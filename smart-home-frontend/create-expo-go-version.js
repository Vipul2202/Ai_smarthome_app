#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Creating Expo Go Compatible Version');
console.log('=====================================\n');

// Read current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Backup original
const backupPath = path.join(__dirname, 'package.json.backup');
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Backed up original package.json');

// Remove problematic dependencies that require dev client
const problematicDeps = [
  'expo-dev-client',
  '@react-native-voice/voice',
  'expo-speech-recognition',
  'react-native-worklets-core'
];

problematicDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    console.log(`🗑️  Temporarily removed: ${dep}`);
  }
});

// Write modified package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Created Expo Go compatible package.json');

// Create simple app.json without dev client plugins
const simpleAppJson = {
  "expo": {
    "name": "Smart Home",
    "slug": "smart-home-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.smarthome.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      },
      "package": "com.smarthome.app"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-secure-store"
    ]
  }
};

// Backup and replace app.json
const appJsonPath = path.join(__dirname, 'app.json');
const appJsonBackup = path.join(__dirname, 'app.json.backup');
if (fs.existsSync(appJsonPath)) {
  fs.copyFileSync(appJsonPath, appJsonBackup);
}
fs.writeFileSync(appJsonPath, JSON.stringify(simpleAppJson, null, 2));
console.log('✅ Created simple app.json for Expo Go');

console.log('\n🚀 Starting Expo Go compatible version...\n');

// Start expo
const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

// Cleanup function
function cleanup() {
  console.log('\n🔄 Restoring original files...');
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, packageJsonPath);
    fs.unlinkSync(backupPath);
    console.log('✅ Restored package.json');
  }
  
  if (fs.existsSync(appJsonBackup)) {
    fs.copyFileSync(appJsonBackup, appJsonPath);
    fs.unlinkSync(appJsonBackup);
    console.log('✅ Restored app.json');
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  cleanup();
  child.kill();
  process.exit();
});

process.on('exit', cleanup);