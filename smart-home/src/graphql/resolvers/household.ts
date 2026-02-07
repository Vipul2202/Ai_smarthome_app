import { Context, requireAuth } from '../context';
import { getUserHouses, checkHouseAccess } from '../../utils/houseAccess';

export const householdResolvers = {
  Query: {
    // Get user's houses (owned + shared)
    houses: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      
      return getUserHouses(context, user.id);
    },

    // Get specific house (with access control)
    house: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      const access = await checkHouseAccess(context, id, user.id);
      
      if (!access.hasAccess) {
        throw new Error('House not found or access denied');
      }

      const house = await context.prisma.house.findUnique({
        where: { id },
        include: {
          user: true,
          inventory: true,
        },
      });

      return {
        ...house,
        userRole: access.role,
      };
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

    // Update house (owner only)
    updateHouse: async (_: any, { id, input }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        return await context.prisma.house.update({
          where: { 
            id,
            userId: user.id,
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

    // Delete house (owner only)
    deleteHouse: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        await context.prisma.house.delete({
          where: { 
            id,
            userId: user.id,
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