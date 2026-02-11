import { GraphQLError } from 'graphql';
import { Context, requireAuth } from '../context';
import crypto from 'crypto';
import {
  notifyHouseAccessGranted,
  notifyInvitationAccepted,
  notifyAccessLevelChanged,
  notifyAccessRemoved,
} from '../../services/houseSharingNotification';

export const houseSharingResolvers = {
  Query: {
    sharedHouses: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);

      // Get all houses shared with this user
      const shares = await context.prisma.houseShare.findMany({
        where: { userId: user.id },
      });

      if (shares.length === 0) {
        return [];
      }

      const houseIds = shares.map(s => s.houseId);

      // Get the houses
      const houses = await context.prisma.house.findMany({
        where: {
          id: { in: houseIds },
        },
        include: {
          user: true,
          inventory: true,
        },
      });

      // Map houses with their role
      return houses.map(house => {
        const share = shares.find(s => s.houseId === house.id);
        return {
          ...house,
          userRole: share?.role || null,
        };
      });
    },

    userByUserId: async (_: any, { userId }: { userId: string }, context: Context) => {
      requireAuth(context);

      const user = await context.prisma.user.findUnique({
        where: { userId },
      });

      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },

    houseInvitations: async (_: any, { houseId }: { houseId: string }, context: Context) => {
      const user = requireAuth(context);

      const house = await context.prisma.house.findUnique({
        where: { id: houseId },
      });

      if (!house || house.userId !== user.id) {
        throw new GraphQLError('Not authorized to view invitations', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.houseInvitation.findMany({
        where: { houseId },
        include: { house: true },
        orderBy: { createdDate: 'desc' },
      });
    },

    houseShares: async (_: any, { houseId }: { houseId: string }, context: Context) => {
      const user = requireAuth(context);

      const house = await context.prisma.house.findUnique({
        where: { id: houseId },
      });

      if (!house || house.userId !== user.id) {
        throw new GraphQLError('Not authorized to view shares', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.prisma.houseShare.findMany({
        where: { houseId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    },
  },

  Mutation: {
    createHouseInvitation: async (
      _: any,
      { input }: { input: { houseId: string; invitedUserId: string; role: 'READ' | 'WRITE'; expiryDays?: number } },
      context: Context
    ) => {
      const user = requireAuth(context);

      console.log('Creating house invitation with input:', input);

      const house = await context.prisma.house.findUnique({
        where: { id: input.houseId },
      });

      if (!house) {
        console.error('House not found:', input.houseId);
        throw new GraphQLError('House not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (house.userId !== user.id) {
        console.error('User not authorized. House owner:', house.userId, 'Current user:', user.id);
        throw new GraphQLError('Not authorized to create invitation', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // Verify the invited user exists
      console.log('Looking up user with userId:', input.invitedUserId);
      const invitedUser = await context.prisma.user.findUnique({
        where: { userId: input.invitedUserId },
      });

      if (!invitedUser) {
        console.error('User not found with userId:', input.invitedUserId);
        throw new GraphQLError('User not found with this User ID', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      console.log('Found invited user:', invitedUser.id, invitedUser.email);

      // Check if user is trying to invite themselves
      if (invitedUser.id === user.id) {
        throw new GraphQLError('You cannot invite yourself to your own house', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check if user already has access
      const existingShare = await context.prisma.houseShare.findUnique({
        where: {
          houseId_userId: {
            houseId: input.houseId,
            userId: invitedUser.id,
          },
        },
      });

      if (existingShare) {
        throw new GraphQLError('This user already has access to your house', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Check if there's already a pending invitation for this user
      const existingInvitation = await context.prisma.houseInvitation.findFirst({
        where: {
          houseId: input.houseId,
          invitedUserId: invitedUser.id,
          status: 'PENDING',
        },
      });

      if (existingInvitation) {
        throw new GraphQLError('There is already a pending invitation for this user', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const inviteCode = crypto.randomBytes(16).toString('hex');
      const expiryDays = input.expiryDays || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      console.log('Creating invitation with code:', inviteCode);

      const invitation = await context.prisma.houseInvitation.create({
        data: {
          houseId: input.houseId,
          inviteCode,
          invitedUserId: invitedUser.id,
          role: input.role,
          expiryDate,
          status: 'PENDING',
        },
        include: { house: true },
      });

      console.log('Invitation created successfully:', invitation.id);

      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/accept-invite/${inviteCode}`;

      return {
        invitation,
        inviteLink,
      };
    },

    acceptHouseInvitation: async (
      _: any,
      { input }: { input: { inviteCode: string } },
      context: Context
    ) => {
      const user = requireAuth(context);

      const invitation = await context.prisma.houseInvitation.findUnique({
        where: { inviteCode: input.inviteCode },
        include: { house: true },
      });

      if (!invitation) {
        throw new GraphQLError('Invalid invitation code', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (invitation.status !== 'PENDING') {
        throw new GraphQLError('Invitation already used or expired', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      if (new Date() > invitation.expiryDate) {
        await context.prisma.houseInvitation.update({
          where: { id: invitation.id },
          data: { status: 'EXPIRED' },
        });
        throw new GraphQLError('Invitation has expired', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      if (invitation.house.userId === user.id) {
        throw new GraphQLError('You cannot join your own house. This invitation is for sharing your house with other users.', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      // Verify this invitation is for the current user
      if (invitation.invitedUserId !== user.id) {
        throw new GraphQLError('This invitation is not for you. It was created for a specific user.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const existingShare = await context.prisma.houseShare.findUnique({
        where: {
          houseId_userId: {
            houseId: invitation.houseId,
            userId: user.id,
          },
        },
      });

      if (existingShare) {
        throw new GraphQLError('You already have access to this house', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      await context.prisma.$transaction([
        context.prisma.houseShare.create({
          data: {
            houseId: invitation.houseId,
            userId: user.id,
            role: invitation.role,
          },
        }),
        context.prisma.houseInvitation.update({
          where: { id: invitation.id },
          data: {
            status: 'ACCEPTED',
            usedDate: new Date(),
          },
        }),
      ]);

      const house = await context.prisma.house.findUnique({
        where: { id: invitation.houseId },
        include: {
          user: true,
          inventory: true,
        },
      });

      // Send notifications
      try {
        const currentUser = await context.prisma.user.findUnique({
          where: { id: user.id },
        });
        
        if (currentUser && house) {
          // Notify the new user
          await notifyHouseAccessGranted(
            user.id,
            house.name,
            invitation.role,
            house.user.name || house.user.email
          );

          // Notify the house owner
          await notifyInvitationAccepted(
            house.userId,
            house.name,
            currentUser.name || '',
            currentUser.email
          );
        }
      } catch (notifError) {
        console.error('Failed to send notifications:', notifError);
        // Don't fail the mutation if notifications fail
      }

      return {
        ...house,
        userRole: invitation.role,
      };
    },

    revokeHouseInvitation: async (
      _: any,
      { invitationId }: { invitationId: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      const invitation = await context.prisma.houseInvitation.findUnique({
        where: { id: invitationId },
        include: { house: true },
      });

      if (!invitation || invitation.house.userId !== user.id) {
        throw new GraphQLError('Not authorized to revoke invitation', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await context.prisma.houseInvitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' },
      });

      return true;
    },

    removeHouseShare: async (
      _: any,
      { shareId }: { shareId: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      const share = await context.prisma.houseShare.findUnique({
        where: { id: shareId },
      });

      if (!share) {
        throw new GraphQLError('Share not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const house = await context.prisma.house.findUnique({
        where: { id: share.houseId },
      });

      if (!house || house.userId !== user.id) {
        throw new GraphQLError('Not authorized to remove share', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await context.prisma.houseShare.delete({
        where: { id: shareId },
      });

      // Send notification
      try {
        const house = await context.prisma.house.findUnique({
          where: { id: share.houseId },
          include: { user: true },
        });

        if (house) {
          await notifyAccessRemoved(
            share.userId,
            house.name,
            house.user.name || house.user.email
          );
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return true;
    },

    updateHouseShareRole: async (
      _: any,
      { shareId, role }: { shareId: string; role: 'READ' | 'WRITE' },
      context: Context
    ) => {
      const user = requireAuth(context);

      const share = await context.prisma.houseShare.findUnique({
        where: { id: shareId },
      });

      if (!share) {
        throw new GraphQLError('Share not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const house = await context.prisma.house.findUnique({
        where: { id: share.houseId },
      });

      if (!house || house.userId !== user.id) {
        throw new GraphQLError('Not authorized to update share', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updatedShare = await context.prisma.houseShare.update({
        where: { id: shareId },
        data: { role },
        include: { user: true },
      });

      // Send notification
      try {
        const house = await context.prisma.house.findUnique({
          where: { id: share.houseId },
          include: { user: true },
        });

        if (house) {
          await notifyAccessLevelChanged(
            share.userId,
            house.name,
            role,
            house.user.name || house.user.email
          );
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      return updatedShare;
    },
  },

  House: {
    shares: async (parent: any, _: any, context: Context) => {
      return context.prisma.houseShare.findMany({
        where: { houseId: parent.id },
        include: { user: true },
      });
    },
    invitations: async (parent: any, _: any, context: Context) => {
      return context.prisma.houseInvitation.findMany({
        where: { houseId: parent.id },
        include: { house: true },
      });
    },
    userRole: async (parent: any, _: any, context: Context) => {
      if (!context.user) return null;
      
      if (parent.userId === context.user.id) {
        return 'WRITE';
      }

      const share = await context.prisma.houseShare.findUnique({
        where: {
          houseId_userId: {
            houseId: parent.id,
            userId: context.user.id,
          },
        },
      });

      return share?.role || null;
    },
  },

  HouseShare: {
    user: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },

  HouseInvitation: {
    house: async (parent: any, _: any, context: Context) => {
      return context.prisma.house.findUnique({
        where: { id: parent.houseId },
      });
    },
    invitedUserId: async (parent: any, _: any, context: Context) => {
      // Return the 6-digit User ID instead of database ID
      if (!parent.invitedUserId) return null;
      
      try {
        const user = await context.prisma.user.findUnique({
          where: { id: parent.invitedUserId },
        });
        
        return user?.userId || null;
      } catch (error) {
        console.error('Error fetching invitedUserId:', error);
        return null;
      }
    },
  },
};
