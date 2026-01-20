#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Simple deployment script starting...');

try {
  // Create dist directory
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
    console.log('✅ Created dist directory');
  }

  // Copy standalone server as server.js
  const standaloneServer = `
// Simple server for Render deployment
const fastify = require('fastify')({ logger: true });

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// GraphQL placeholder
fastify.post('/graphql', async () => {
  return { data: { message: 'Server is running' } };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log('🚀 Server ready at http://' + HOST + ':' + PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
`;

  fs.writeFileSync('dist/server.js', standaloneServer);
  console.log('✅ Created dist/server.js');

  // Verify file exists
  if (fs.existsSync('dist/server.js')) {
    console.log('✅ dist/server.js verified');
    const stats = fs.statSync('dist/server.js');
    console.log('📊 File size:', stats.size, 'bytes');
  } else {
    throw new Error('dist/server.js was not created');
  }

  console.log('🎉 Deployment preparation completed successfully!');
} catch (error) {
  console.error('❌ Deployment preparation failed:', error.message);
  process.exit(1);
}