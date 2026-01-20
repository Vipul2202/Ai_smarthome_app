#!/usr/bin/env node

// Load environment variables if .env file exists (for local testing)
const fs = require('fs');
const path = require('path');

// Try to load .env from multiple locations
const envPaths = ['.env', 'dist/.env', '../.env'];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`📄 Loaded environment from ${envPath}`);
    break;
  }
}

console.log('🚀 Smart Home Backend - Deployment Start');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || '4000');
console.log('Current directory:', process.cwd());

// Check if required files exist
const requiredFiles = [
  'dist/server.js',
  'package.json'
];

const optionalFiles = [
  'node_modules/@prisma/client',
  'dist/package.json',
  '.env'
];

console.log('\n📋 Checking required files...');
let allRequiredFilesExist = true;

for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
  
  if (!exists) {
    console.error(`❌ Critical file missing: ${file}`);
    allRequiredFilesExist = false;
  }
}

console.log('\n📋 Checking optional files...');
for (const file of optionalFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '⚠️'} ${file}: ${exists ? 'Found' : 'Not found (optional)'}`);
}

if (!allRequiredFilesExist) {
  console.error('\n❌ Some required files are missing. Deployment cannot continue.');
  process.exit(1);
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const optionalEnvVars = ['OPENAI_API_KEY', 'PORT', 'NODE_ENV'];

let allRequiredEnvVarsExist = true;

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  console.log(`${value ? '✅' : '❌'} ${envVar}: ${value ? 'Set' : 'Missing'}`);
  
  if (!value) {
    console.error(`❌ Required environment variable missing: ${envVar}`);
    allRequiredEnvVarsExist = false;
  }
}

for (const envVar of optionalEnvVars) {
  const value = process.env[envVar];
  console.log(`${value ? '✅' : '⚠️'} ${envVar}: ${value ? 'Set' : 'Not set'}`);
}

if (!allRequiredEnvVarsExist) {
  console.error('\n❌ Some required environment variables are missing.');
  console.log('⚠️ Continuing anyway - server may have limited functionality.');
}

console.log('\n🎯 Starting server...');

// Start the server
try {
  require('./dist/server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Try alternative server locations
  const alternativeServers = ['./dist/server.js', './server.js', './src/server.js'];
  
  for (const serverPath of alternativeServers) {
    if (fs.existsSync(serverPath)) {
      console.log(`🔄 Trying alternative server: ${serverPath}`);
      try {
        require(serverPath);
        return; // Success
      } catch (altError) {
        console.error(`❌ Alternative server ${serverPath} also failed:`, altError.message);
      }
    }
  }
  
  console.error('❌ All server startup attempts failed.');
  process.exit(1);
}