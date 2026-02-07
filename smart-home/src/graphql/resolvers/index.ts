import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { authResolvers } from './auth';
import { userResolvers } from './user';
import { householdResolvers } from './household';
import { inventoryResolvers } from './inventory-simple';
import { aiResolvers } from './ai';
import { timerResolvers } from './timer';
import { houseSharingResolvers } from './houseSharing';

export const resolvers: any = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    ...authResolvers.Query,
    ...householdResolvers.Query,
    ...inventoryResolvers.Query,
    ...aiResolvers.Query,
    ...timerResolvers.Query,
    ...houseSharingResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...householdResolvers.Mutation,
    ...inventoryResolvers.Mutation,
    ...aiResolvers.Mutation,
    ...timerResolvers.Mutation,
    ...houseSharingResolvers.Mutation,
  },

  // Type resolvers
  User: {
    // Prisma handles relationships automatically
  },

  House: {
    ...houseSharingResolvers.House,
  },

  HouseShare: {
    ...houseSharingResolvers.HouseShare,
  },

  HouseInvitation: {
    ...houseSharingResolvers.HouseInvitation,
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