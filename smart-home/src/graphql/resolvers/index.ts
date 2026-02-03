import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { authResolvers } from './auth';
import { userResolvers } from './user';
import { householdResolvers } from './household';
import { inventoryResolvers } from './inventory-simple';
import { aiResolvers } from './ai';
import { timerResolvers } from './timer';

export const resolvers: any = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    ...authResolvers.Query,
    ...householdResolvers.Query,
    ...inventoryResolvers.Query,
    ...aiResolvers.Query,
    ...timerResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...householdResolvers.Mutation,
    ...inventoryResolvers.Mutation,
    ...aiResolvers.Mutation,
    ...timerResolvers.Mutation,
  },

  // Simple type resolvers for remaining models
  User: {
    // Prisma handles relationships automatically
  },

  House: {
    // Prisma handles relationships automatically
  },

  InventoryItem: {
    // Prisma handles relationships automatically
  },

  KitchenTimer: {
    // Prisma handles relationships automatically
  },

  AIScan: {
    // Prisma handles relationships automatically
  },

  UserPreferences: {
    // Prisma handles relationships automatically
  },
};