import { Context, requireAuth } from '../context';

export const houseResolvers = {
  Query: {
    houses: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      
      return context.prisma.house.findMany({
        where: { userId: user.id },
        orderBy: { createdDate: 'desc' },
      });
    },

    house: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      const house = await context.prisma.house.findFirst({
        where: { 
          id,
          userId: user.id 
        },
      });

      if (!house) {
        throw new Error('House not found or access denied');
      }

      return house;
    },
  },

  Mutation: {
    createHouse: async (_: any, { input }: any, context: Context) => {
      const user = requireAuth(context);
      const { name, description } = input;

      return context.prisma.house.create({
        data: {
          name,
          description,
          userId: user.id,
        },
      });
    },

    updateHouse: async (_: any, { id, input }: any, context: Context) => {
      const user = requireAuth(context);
      
      // Check if house belongs to user
      const existingHouse = await context.prisma.house.findFirst({
        where: { 
          id,
          userId: user.id 
        },
      });

      if (!existingHouse) {
        throw new Error('House not found or access denied');
      }

      return context.prisma.house.update({
        where: { id },
        data: input,
      });
    },

    deleteHouse: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      // Check if house belongs to user
      const existingHouse = await context.prisma.house.findFirst({
        where: { 
          id,
          userId: user.id 
        },
      });

      if (!existingHouse) {
        throw new Error('House not found or access denied');
      }

      await context.prisma.house.delete({
        where: { id },
      });

      return true;
    },
  },

  House: {
    user: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },

  User: {
    houses: async (parent: any, _: any, context: Context) => {
      return context.prisma.house.findMany({
        where: { userId: parent.id },
        orderBy: { createdDate: 'desc' },
      });
    },
  },
};