// Fix Prisma client issues on Windows
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma client issues...');

try {
  // Remove problematic files
  const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');
  
  if (fs.existsSync(prismaClientPath)) {
    console.log('📁 Found Prisma client directory');
    
    // Find and remove .tmp files
    const files = fs.readdirSync(prismaClientPath);
    const tmpFiles = files.filter(file => file.includes('.tmp'));
    
    tmpFiles.forEach(file => {
      try {
        const filePath = path.join(prismaClientPath, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️ Removed ${file}`);
      } catch (error) {
        console.log(`⚠️ Could not remove ${file}:`, error.message);
      }
    });
  }
  
  console.log('✅ Prisma client cleanup completed');
  
  // Try to regenerate
  const { spawn } = require('child_process');
  
  console.log('🔄 Regenerating Prisma client...');
  const generate = spawn('npx', ['prisma', 'generate', '--force'], {
    stdio: 'inherit',
    shell: true
  });
  
  generate.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Prisma client regenerated successfully');
    } else {
      console.log('❌ Prisma client regeneration failed');
    }
  });
  
} catch (error) {
  console.error('❌ Error fixing Prisma:', error.message);
}