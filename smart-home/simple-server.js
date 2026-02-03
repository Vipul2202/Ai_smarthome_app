// Simplified server for testing
const Fastify = require('fastify');
const { ApolloServer } = require('@apollo/server');
const { fastifyApolloDrainPlugin } = require('@as-integrations/fastify');

const typeDefs = `
  type Query {
    hello: String
    test: String
  }
  
  type Mutation {
    testMutation(input: String): String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello World!',
    test: () => 'GraphQL is working!'
  },
  Mutation: {
    testMutation: (_, { input }) => `Received: ${input}`
  }
};

async function start() {
  const fastify = Fastify({ logger: true });
  
  // CORS
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });
  
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });
  
  await apollo.start();
  
  await fastify.register(async function (fastify) {
    await fastify.register(require('@as-integrations/fastify').default(apollo), {
      context: async (request, reply) => ({
        request,
        reply
      })
    });
  });
  
  // Health check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));
  
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Simple server ready at http://localhost:4000/graphql');
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();