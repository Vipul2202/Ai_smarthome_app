// Backup server file for Render deployment
const fastify = require('fastify')({ 
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Add CORS headers
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    reply.code(200).send();
  }
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime()
  };
});

// GraphQL endpoint
fastify.post('/graphql', async (request, reply) => {
  const { query } = request.body || {};
  
  // Handle introspection
  if (query && query.includes('__schema')) {
    return {
      data: {
        __schema: {
          types: [
            { name: 'Query', description: 'Root query type' },
            { name: 'Mutation', description: 'Root mutation type' }
          ]
        }
      }
    };
  }

  // Handle basic queries
  if (query && query.includes('__typename')) {
    return { data: { __typename: 'Query' } };
  }

  return {
    data: {
      message: 'Smart Home GraphQL API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'Smart Home Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      graphql: '/graphql'
    }
  };
});

// OCR endpoints
fastify.post('/ocr/inventory', async (request, reply) => {
  return {
    success: true,
    message: 'OCR service ready',
    data: { items: [] }
  };
});

fastify.post('/ocr/receipt', async (request, reply) => {
  return {
    success: true,
    message: 'Receipt OCR ready',
    data: { items: [] }
  };
});

// Transcription endpoint
fastify.post('/api/transcribe', async (request, reply) => {
  return {
    success: true,
    transcript: 'Transcription service ready',
    message: 'Audio endpoint ready'
  };
});

// Start server
async function start() {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Smart Home Server ready at http://${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
    console.log(`🔗 GraphQL: http://${HOST}:${PORT}/graphql`);
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();