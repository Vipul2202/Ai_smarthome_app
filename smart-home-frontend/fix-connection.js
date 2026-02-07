const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('🔍 Smart Home - Network Connection Fixer\n');

// Get network interfaces
const interfaces = os.networkInterfaces();
let ipAddress = null;

// Find the first non-internal IPv4 address
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    // Skip internal and non-IPv4 addresses
    if (iface.family === 'IPv4' && !iface.internal) {
      ipAddress = iface.address;
      console.log(`📍 Found IP address: ${ipAddress} (${name})`);
      break;
    }
  }
  if (ipAddress) break;
}

if (!ipAddress) {
  console.log('❌ Could not find IP address. Using localhost.');
  ipAddress = 'localhost';
}

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Current .env file found');
} catch (error) {
  console.log('⚠️  No .env file found, creating new one');
}

// Update or create .env content
const newEnvContent = `# Mobile Device Configuration - Auto-generated
EXPO_PUBLIC_API_URL=http://${ipAddress}:4000
EXPO_PUBLIC_API_URL_FALLBACK=http://localhost:4000
EXPO_PUBLIC_GRAPHQL_URL=http://${ipAddress}:4000/graphql
EXPO_PUBLIC_GRAPHQL_URL_FALLBACK=http://localhost:4000/graphql
EXPO_PUBLIC_UPLOAD_URL=http://${ipAddress}:4000/upload

# Fallback URLs for different network configurations
EXPO_PUBLIC_API_URL_FALLBACK_1=http://localhost:4000
EXPO_PUBLIC_API_URL_FALLBACK_2=http://10.0.2.2:4000

# App Configuration
EXPO_PUBLIC_APP_NAME=Smart Home
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_SITE_NAME=Smart Home Manager
EXPO_PUBLIC_SITE_URL=http://${ipAddress}:3000

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=258429278457-l97c4bpau8tq7nvn3h6nttc655r2gjra.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=258429278457-v6de8orca31amf25oqo6fm93orv56kpv.apps.googleusercontent.com
`;

// Write updated .env file
fs.writeFileSync(envPath, newEnvContent);
console.log('✅ .env file updated successfully!\n');

console.log('📋 Configuration:');
console.log(`   API URL: http://${ipAddress}:4000`);
console.log(`   GraphQL: http://${ipAddress}:4000/graphql\n`);

console.log('🎯 Next Steps:');
console.log('   1. Make sure backend is running: cd smart-home && npm run dev');
console.log('   2. Restart this app: npm start -- --clear');
console.log('   3. Test in browser: http://' + ipAddress + ':4000/graphql\n');

console.log('💡 Tips:');
console.log('   - Make sure your phone and computer are on the same WiFi');
console.log('   - If using emulator, you might need to use localhost or 10.0.2.2');
console.log('   - Check firewall settings if connection still fails\n');
