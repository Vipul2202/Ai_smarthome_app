import { Context, requireAuth } from '../context';

export const householdResolvers = {
  Query: {
    // Get user's houses
    houses: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      
      return context.prisma.house.findMany({
        where: { userId: user.id },
        orderBy: { createdDate: 'desc' },
      });
    },

    // Get specific house
    house: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      const house = await context.prisma.house.findFirst({
        where: { 
          id,
          userId: user.id,
        },
      });

      if (!house) {
        throw new Error('House not found or access denied');
      }

      return house;
    },
  },

  Mutation: {
    // Create a new house
    createHouse: async (_: any, { input }: any, context: Context) => {
      const user = requireAuth(context);
      const { name, description } = input;

      const house = await context.prisma.house.create({
        data: {
          name,
          description,
          userId: user.id,
        },
      });

      return house;
    },

    // Update house
    updateHouse: async (_: any, { id, input }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        // Optimized single query - update with access control
        return await context.prisma.house.update({
          where: { 
            id,
            userId: user.id, // Access control in where clause
          },
          data: input,
        });
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new Error('House not found or access denied');
        }
        throw error;
      }
    },

    // Delete house
    deleteHouse: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        // Optimized single query - delete with access control
        await context.prisma.house.delete({
          where: { 
            id,
            userId: user.id, // Access control in where clause
          },
        });
        return true;
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new Error('House not found or access denied');
        }
        throw error;
      }
    },
  },
};