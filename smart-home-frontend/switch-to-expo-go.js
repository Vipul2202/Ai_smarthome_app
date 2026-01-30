// Simple script to switch to Expo Go mode
const { spawn } = require('child_process');

const child = spawn('npx', ['expo', 'start', '--lan'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a bit then send 's' to switch to Expo Go
setTimeout(() => {
  child.stdin.write('s\n');
}, 5000);

process.on('SIGINT', () => {
  child.kill();
  process.exit();
});