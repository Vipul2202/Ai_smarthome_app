import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'HOUSE_SHARE' | 'INVITATION' | 'ACCESS_CHANGE';
  metadata?: Record<string, any>;
}

/**
 * Send notification to user (placeholder - integrate with your notification service)
 */
async function sendNotification(data: NotificationData) {
  // TODO: Integrate with your notification service (Firebase, OneSignal, etc.)
  console.log('📧 Notification:', data);
  
  // For now, just log the notification
  // In production, you would:
  // 1. Send push notification
  // 2. Send email notification
  // 3. Create in-app notification record
}

/**
 * Notify user when they receive house access
 */
export async function notifyHouseAccessGranted(
  userId: string,
  houseName: string,
  role: 'READ' | 'WRITE',
  ownerName: string
) {
  await sendNotification({
    userId,
    title: 'New House Access',
    message: `${ownerName} shared "${houseName}" with you (${role === 'READ' ? 'View Only' : 'Edit Access'})`,
    type: 'HOUSE_SHARE',
    metadata: {
      houseName,
      role,
      ownerName,
    },
  });
}

/**
 * Notify owner when someone accepts their invitation
 */
export async function notifyInvitationAccepted(
  ownerId: string,
  houseName: string,
  acceptedByName: string,
  acceptedByEmail: string
) {
  await sendNotification({
    userId: ownerId,
    title: 'Invitation Accepted',
    message: `${acceptedByName || acceptedByEmail} accepted your invitation to "${houseName}"`,
    type: 'INVITATION',
    metadata: {
      houseName,
      acceptedByName,
      acceptedByEmail,
    },
  });
}

/**
 * Notify user when their access level changes
 */
export async function notifyAccessLevelChanged(
  userId: string,
  houseName: string,
  newRole: 'READ' | 'WRITE',
  changedBy: string
) {
  await sendNotification({
    userId,
    title: 'Access Level Changed',
    message: `${changedBy} changed your access to "${houseName}" (${newRole === 'READ' ? 'View Only' : 'Edit Access'})`,
    type: 'ACCESS_CHANGE',
    metadata: {
      houseName,
      newRole,
      changedBy,
    },
  });
}

/**
 * Notify user when their access is removed
 */
export async function notifyAccessRemoved(
  userId: string,
  houseName: string,
  removedBy: string
) {
  await sendNotification({
    userId,
    title: 'Access Removed',
    message: `${removedBy} removed your access to "${houseName}"`,
    type: 'ACCESS_CHANGE',
    metadata: {
      houseName,
      removedBy,
    },
  });
}

/**
 * Clean up expired invitations (run as a scheduled job)
 */
export async function cleanupExpiredInvitations() {
  const now = new Date();
  
  const result = await prisma.houseInvitation.updateMany({
    where: {
      status: 'PENDING',
      expiryDate: {
        lt: now,
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  console.log(`🧹 Cleaned up ${result.count} expired invitations`);
  return result.count;
}

/**
 * Get sharing statistics for a house
 */
export async function getHouseSharingStats(houseId: string) {
  const [activeShares, pendingInvitations, acceptedInvitations] = await Promise.all([
    prisma.houseShare.count({
      where: { houseId },
    }),
    prisma.houseInvitation.count({
      where: {
        houseId,
        status: 'PENDING',
      },
    }),
    prisma.houseInvitation.count({
      where: {
        houseId,
        status: 'ACCEPTED',
      },
    }),
  ]);

  return {
    activeShares,
    pendingInvitations,
    acceptedInvitations,
    totalInvitations: pendingInvitations + acceptedInvitations,
  };
}

/**
 * Get user's sharing activity
 */
export async function getUserSharingActivity(userId: string) {
  const [ownedHousesWithShares, sharedHousesAccess] = await Promise.all([
    prisma.house.findMany({
      where: { userId },
      include: {
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invitations: {
          where: {
            status: 'PENDING',
          },
        },
      },
    }),
    prisma.houseShare.findMany({
      where: { userId },
      include: {
        house: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    ownedHouses: ownedHousesWithShares.map(house => ({
      id: house.id,
      name: house.name,
      sharesCount: house.shares.length,
      pendingInvitations: house.invitations.length,
      sharedWith: house.shares.map(share => ({
        user: share.user,
        role: share.role,
        since: share.createdAt,
      })),
    })),
    sharedHouses: sharedHousesAccess.map(share => ({
      id: share.house.id,
      name: share.house.name,
      owner: share.house.user,
      role: share.role,
      since: share.createdAt,
    })),
  };
}
