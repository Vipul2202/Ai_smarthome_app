// Simple test to check if server starts
const { spawn } = require('child_process');

console.log('🚀 Starting server test...');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

let serverStarted = false;
let timeout;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📝 Server output:', output);
  
  if (output.includes('Server ready at') || output.includes('🚀')) {
    console.log('✅ Server started successfully!');
    serverStarted = true;
    clearTimeout(timeout);
    
    // Test health endpoint
    setTimeout(async () => {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:4000/health');
        const data = await response.json();
        console.log('✅ Health check:', data);
      } catch (error) {
        console.log('❌ Health check failed:', error.message);
      }
      
      // Kill server
      server.kill();
      process.exit(0);
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  console.log('❌ Server error:', error);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (!serverStarted) {
    console.log('❌ Server failed to start properly');
  }
});

// Timeout after 30 seconds
timeout = setTimeout(() => {
  console.log('⏰ Server startup timeout');
  server.kill();
  process.exit(1);
}, 30000);