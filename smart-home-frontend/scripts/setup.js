#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏠 Smart Home React Native App Setup');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error(`❌ Error: Node.js ${nodeVersion} is not supported. Please use Node.js 18 or higher.`);
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created');
  console.log('⚠️  Please update the API URLs in .env to match your backend');
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Check Expo CLI
console.log('\n🔧 Checking Expo CLI...');
try {
  execSync('npx expo --version', { stdio: 'pipe' });
  console.log('✅ Expo CLI is available');
} catch (error) {
  console.log('📦 Installing Expo CLI...');
  try {
    execSync('npm install -g @expo/cli', { stdio: 'inherit' });
    console.log('✅ Expo CLI installed successfully');
  } catch (installError) {
    console.error('❌ Error installing Expo CLI:', installError.message);
    console.log('💡 You can install it manually: npm install -g @expo/cli');
  }
}

// Create assets directory if it doesn't exist
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
  console.log('✅ Assets directory created');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update the API URLs in .env to match your backend');
console.log('2. Add app icons and splash screen to the assets/ directory');
console.log('3. Start the development server: npm start');
console.log('4. Run on device: npm run ios or npm run android');
console.log('\n📖 For more information, see README.md');