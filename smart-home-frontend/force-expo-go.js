const { spawn } = require('child_process');

console.log('Attempting to switch to Expo Go mode...');

// Try to send 's' to switch to Expo Go
const child = spawn('cmd', ['/c', 'echo s'], {
  stdio: 'pipe'
});

child.stdout.on('data', (data) => {
  console.log('Output:', data.toString());
});

child.on('close', (code) => {
  console.log('Switched to Expo Go mode');
});