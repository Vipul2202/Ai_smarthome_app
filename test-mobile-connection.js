#!/usr/bin/env node

const http = require('http');

console.log('📱 Mobile Connection Test');
console.log('========================');

const IP = '192.168.29.65';

// Test if backend is accessible from mobile
function testBackendFromMobile() {
  return new Promise((resolve) => {
    console.log(`🔍 Testing backend accessibility from mobile...`);
    
    const req = http.get(`http://${IP}:4000/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ Backend accessible at: http://${IP}:4000`);
          console.log(`✅ Mobile devices can reach the API`);
          resolve(true);
        } else {
          console.log(`❌ Backend not responding properly (Status: ${res.statusCode})`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Backend not accessible from mobile: ${error.message}`);
      console.log(`   Make sure backend is running: npm run dev`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Backend timeout - check network connectivity`);
      resolve(false);
    });
  });
}

// Test if frontend is accessible from mobile
function testFrontendFromMobile() {
  return new Promise((resolve) => {
    console.log(`🔍 Testing frontend accessibility from mobile...`);
    
    const req = http.get(`http://${IP}:8081`, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Frontend accessible at: exp://${IP}:8081`);
        console.log(`✅ QR code should work for mobile devices`);
        resolve(true);
      } else {
        console.log(`❌ Frontend not responding properly (Status: ${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Frontend not accessible from mobile: ${error.message}`);
      console.log(`   Make sure frontend is running with: npx expo start --lan`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ Frontend timeout - check if Expo is running`);
      resolve(false);
    });
  });
}

async function runMobileTest() {
  console.log(`🌐 Testing connectivity for IP: ${IP}\n`);
  
  const backendOk = await testBackendFromMobile();
  const frontendOk = await testFrontendFromMobile();
  
  console.log('\n📊 Mobile Connectivity Test Results:');
  console.log('====================================');
  
  if (backendOk && frontendOk) {
    console.log('🎉 Mobile app should work perfectly!');
    console.log('\n📱 Instructions for mobile:');
    console.log('1. Install Expo Go app on your phone');
    console.log('2. Ensure phone is on same WiFi network');
    console.log(`3. Scan QR code or enter: exp://${IP}:8081`);
    console.log('4. App should load and connect to backend');
    
    console.log('\n🎤 Voice Control Features:');
    console.log('• Microphone permission will be requested');
    console.log('• Voice commands will be processed by AI');
    console.log('• Categories will be auto-detected');
    console.log('• Manual category selection available');
  } else {
    console.log('⚠️  Mobile connectivity issues detected:');
    if (!backendOk) {
      console.log('   • Backend not accessible - start with: npm run dev');
      console.log('   • Check Windows Firewall settings');
    }
    if (!frontendOk) {
      console.log('   • Frontend not accessible - start with: npx expo start --lan');
      console.log('   • Check if port 8081 is available');
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('• Ensure both devices on same WiFi network');
    console.log('• Allow Node.js through Windows Firewall');
    console.log('• Try tunnel mode: npx expo start --tunnel');
  }
}

runMobileTest().catch(console.error);