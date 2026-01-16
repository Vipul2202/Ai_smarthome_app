#!/usr/bin/env node

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const ipAddress = getLocalIPAddress();

console.log('🌐 Network Configuration for Mobile Device');
console.log('==========================================');
console.log(`Your computer's IP address: ${ipAddress}`);
console.log('');
console.log('📱 To run on mobile device, update your .env file:');
console.log('');
console.log(`EXPO_PUBLIC_API_URL=http://${ipAddress}:4000`);
console.log(`EXPO_PUBLIC_GRAPHQL_URL=http://${ipAddress}:4000/graphql`);
console.log(`EXPO_PUBLIC_UPLOAD_URL=http://${ipAddress}:4000/upload`);
console.log('');
console.log('💡 Make sure your mobile device is on the same WiFi network!');

// Write the mobile config to a separate file
const fs = require('fs');
const mobileEnvContent = `# Mobile Device Configuration
# Use this configuration when testing on physical devices
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
console.log('✅ Created .env.mobile file with your IP configuration');
console.log('');
console.log('🔄 To switch to mobile config:');
console.log('   cp .env.mobile .env');
console.log('');
console.log('🔄 To switch back to localhost:');
console.log('   cp .env.example .env');