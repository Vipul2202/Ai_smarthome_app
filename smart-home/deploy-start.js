#!/usr/bin/env node

console.log('🚀 Smart Home Backend - Starting...');
console.log('Node.js version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', process.env.PORT || '4000');

const fs = require('fs');

// Check if server file exists
if (fs.existsSync('dist/server.js')) {
  console.log('✅ dist/server.js found');
  try {
    require('./dist/server.js');
  } catch (error) {
    console.error('❌ Failed to start dist/server.js:', error.message);
    console.log('🔄 Trying backup server...');
    
    // Try backup server
    if (fs.existsSync('server-backup.js')) {
      try {
        require('./server-backup.js');
        return;
      } catch (backupError) {
        console.error('❌ Backup server also failed:', backupError.message);
      }
    }
    
    process.exit(1);
  }
} else {
  console.error('❌ dist/server.js not found');
  
  // Try to copy backup server
  if (fs.existsSync('server-backup.js')) {
    console.log('🔄 Copying backup server to dist/server.js...');
    try {
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
      }
      fs.copyFileSync('server-backup.js', 'dist/server.js');
      console.log('✅ Backup server copied successfully');
      require('./dist/server.js');
      return;
    } catch (copyError) {
      console.error('❌ Failed to copy backup server:', copyError.message);
    }
  }
  
  console.log('📁 Current directory contents:');
  try {
    const files = fs.readdirSync('.');
    files.forEach(file => console.log(`  - ${file}`));
    
    if (fs.existsSync('dist')) {
      console.log('📁 dist directory contents:');
      const distFiles = fs.readdirSync('dist');
      distFiles.forEach(file => console.log(`  - dist/${file}`));
    }
  } catch (err) {
    console.log('Could not list directory contents');
  }
  
  console.error('❌ All server startup attempts failed');
  process.exit(1);
}