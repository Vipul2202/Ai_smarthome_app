#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Smart Home App in Pure Expo Go Mode');
console.log('===============================================\n');

// Backup original app.json
const originalAppJson = path.join(__dirname, 'app.json');
const backupAppJson = path.join(__dirname, 'app.json.backup');
const expoGoAppJson = path.join(__dirname, 'app.expo-go.json');

// Create backup
if (fs.existsSync(originalAppJson)) {
  fs.copyFileSync(originalAppJson, backupAppJson);
  console.log('✅ Backed up original app.json');
}

// Use Expo Go compatible config
if (fs.existsSync(expoGoAppJson)) {
  fs.copyFileSync(expoGoAppJson, originalAppJson);
  console.log('✅ Using Expo Go compatible configuration');
}

console.log('📱 This version will work with Expo Go!\n');

// Start expo
const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🔄 Restoring original configuration...');
  if (fs.existsSync(backupAppJson)) {
    fs.copyFileSync(backupAppJson, originalAppJson);
    fs.unlinkSync(backupAppJson);
    console.log('✅ Original app.json restored');
  }
  child.kill();
  process.exit();
});

process.on('exit', () => {
  if (fs.existsSync(backupAppJson)) {
    fs.copyFileSync(backupAppJson, originalAppJson);
    fs.unlinkSync(backupAppJson);
  }
});