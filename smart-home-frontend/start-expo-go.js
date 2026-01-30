#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

console.log('🚀 Starting Smart Home App in Expo Go Mode');
console.log('==========================================\n');

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
console.log(`🌐 Your IP: ${ipAddress}`);
console.log('📱 Make sure your mobile device is on the same WiFi network!\n');

// Start expo with LAN mode for local network access
const child = spawn('npm', ['run', 'start', '--', '--lan'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

process.on('SIGINT', () => {
  child.kill();
  process.exit();
});