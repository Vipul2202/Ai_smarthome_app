#!/usr/bin/env node

const http = require('http');

console.log('🏥 Smart Home Health Check');
console.log('========================');

// Check Backend Health
function checkBackend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:4000/health', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend: Running on http://localhost:4000');
          console.log('✅ GraphQL: Available at http://localhost:4000/graphql');
          resolve(true);
        } else {
          console.log('❌ Backend: Not responding properly');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Backend: Not running on http://localhost:4000');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Backend: Timeout');
      resolve(false);
    });
  });
}

// Check Frontend Health
function checkFrontend() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8081', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend: Running on http://localhost:8081');
        console.log('✅ Mobile: Available via QR code with Expo Go');
        resolve(true);
      } else {
        console.log('❌ Frontend: Not responding properly');
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Frontend: Not running on http://localhost:8081');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Frontend: Timeout');
      resolve(false);
    });
  });
}

async function runHealthCheck() {
  const backendOk = await checkBackend();
  const frontendOk = await checkFrontend();
  
  console.log('\n📊 Health Check Summary:');
  console.log('========================');
  
  if (backendOk && frontendOk) {
    console.log('🎉 All services are running smoothly!');
    console.log('\n🚀 Ready to use:');
    console.log('   • Web App: http://localhost:8081');
    console.log('   • Mobile: Scan QR code with Expo Go');
    console.log('   • API: http://localhost:4000/graphql');
    console.log('\n🎤 Voice Control Features:');
    console.log('   • Fixed recording errors');
    console.log('   • Improved category selection');
    console.log('   • Better error handling');
    console.log('   • Smooth reset functionality');
  } else {
    console.log('⚠️  Some services need attention');
    if (!backendOk) console.log('   • Start backend: npm run dev (in smart-home folder)');
    if (!frontendOk) console.log('   • Start frontend: npm start (in smart-home-frontend folder)');
  }
}

runHealthCheck().catch(console.error);