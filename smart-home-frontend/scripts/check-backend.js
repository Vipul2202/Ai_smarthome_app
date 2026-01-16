#!/usr/bin/env node

const http = require('http');

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

console.log('🔍 Checking backend connectivity...\n');

function checkEndpoint(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`✅ ${name}: ${url} - OK (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`⚠️  ${name}: ${url} - Status ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`❌ ${name}: ${url} - ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`⏰ ${name}: ${url} - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkBackend() {
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`GraphQL URL: ${GRAPHQL_URL}\n`);

  const backendOk = await checkEndpoint(BACKEND_URL, 'Backend API');
  const graphqlOk = await checkEndpoint(GRAPHQL_URL, 'GraphQL Endpoint');

  console.log('\n📋 Backend Status Summary:');
  console.log(`Backend API: ${backendOk ? '✅ Connected' : '❌ Not accessible'}`);
  console.log(`GraphQL: ${graphqlOk ? '✅ Connected' : '❌ Not accessible'}`);

  if (!backendOk || !graphqlOk) {
    console.log('\n🚨 Backend Issues Detected!');
    console.log('\n💡 To fix this:');
    console.log('1. Make sure your backend is running:');
    console.log('   cd smart-home');
    console.log('   npm run dev');
    console.log('\n2. Verify the backend is accessible at http://localhost:4000');
    console.log('3. Check that GraphQL playground works at http://localhost:4000/graphql');
    console.log('\n4. If using a physical device, update .env with your computer\'s IP address');
    
    process.exit(1);
  } else {
    console.log('\n🎉 Backend is ready! You can now start the React Native app.');
  }
}

checkBackend();