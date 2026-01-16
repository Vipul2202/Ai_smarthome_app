#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');

console.log('📱 Smart Home Mobile Setup');
console.log('==========================\n');

// Get IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const ipAddress = getLocalIPAddress();

console.log(`🌐 Your computer's IP address: ${ipAddress}`);
console.log('📱 Make sure your mobile device is on the same WiFi network!\n');

// Create mobile environment configuration
const mobileEnvContent = `# Mobile Device Configuration
EXPO_PUBLIC_API_URL=http://${ipAddress}:4000
EXPO_PUBLIC_GRAPHQL_URL=http://${ipAddress}:4000/graphql
EXPO_PUBLIC_UPLOAD_URL=http://${ipAddress}:4000/upload

# App Configuration
EXPO_PUBLIC_APP_NAME=Smart Home
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_SITE_NAME=Smart Home Manager
EXPO_PUBLIC_SITE_URL=http://${ipAddress}:3000
`;

fs.writeFileSync('.env.mobile', mobileEnvContent);
fs.writeFileSync('.env', mobileEnvContent);

console.log('✅ Updated .env configuration for mobile device');
console.log(`✅ Backend should be accessible at: http://${ipAddress}:4000`);
console.log(`✅ GraphQL endpoint: http://${ipAddress}:4000/graphql\n`);

console.log('📋 Next Steps:');
console.log('1. Make sure your backend is running: cd smart-home && npm run dev');
console.log('2. Install Expo Go app on your mobile device');
console.log('3. Scan the QR code that will appear');
console.log('4. Wait for the app to load on your device\n');

console.log('🚀 Starting Expo development server...\n');

try {
  execSync('expo start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting Expo:', error.message);
  console.log('\n💡 Try running: npx expo start');
}