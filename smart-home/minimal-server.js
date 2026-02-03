// Minimal working server without Prisma for testing
require('dotenv').config();
const Fastify = require('fastify');

async function start() {
  const fastify = Fastify({ 
    logger: {
      level: 'info'
    }
  });
  
  // CORS
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });
  
  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'bypassed',
    version: '1.0.0'
  }));
  
  // Simple GraphQL endpoint for testing
  fastify.post('/graphql', async (request, reply) => {
    const { query, variables } = request.body;
    
    console.log('📝 GraphQL Request:', { query, variables });
    
    // Simple test responses
    if (query.includes('inventoryItems')) {
      return {
        data: {
          inventoryItems: []
        }
      };
    }
    
    if (query.includes('houses')) {
      return {
        data: {
          houses: [
            {
              id: 'test-house-1',
              name: 'Test House',
              description: 'A test house for debugging',
              createdDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      };
    }
    
    if (query.includes('__schema')) {
      return {
        data: {
          __schema: {
            types: [
              { name: 'Query' },
              { name: 'Mutation' },
              { name: 'House' },
              { name: 'InventoryItem' }
            ]
          }
        }
      };
    }
    
    // Default response
    return {
      data: {
        test: 'GraphQL endpoint is working'
      }
    };
  });
  
  // Catch all for debugging
  fastify.get('*', async (request, reply) => {
    return {
      message: 'Smart Home API is running',
      endpoint: request.url,
      method: request.method
    };
  });
  
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Minimal server ready at http://localhost:4000');
    console.log('📊 Health check: http://localhost:4000/health');
    console.log('🔍 GraphQL: http://localhost:4000/graphql');
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
}

start();