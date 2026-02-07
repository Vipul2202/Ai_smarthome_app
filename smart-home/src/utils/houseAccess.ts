import { Context } from '../graphql/context';

export interface HouseAccessResult {
  hasAccess: boolean;
  role: 'READ' | 'WRITE' | null;
  isOwner: boolean;
}

/**
 * Check if a user has access to a house and what role they have
 * @param context GraphQL context
 * @param houseId House ID to check access for
 * @param userId User ID to check
 * @param requireWrite Whether write access is required
 * @returns Access result with role information
 */
export async function checkHouseAccess(
  context: Context,
  houseId: string,
  userId: string,
  requireWrite: boolean = false
): Promise<HouseAccessResult> {
  // First check if user is the owner
  const house = await context.prisma.house.findUnique({
    where: { id: houseId },
    select: { userId: true },
  });

  if (!house) {
    return { hasAccess: false, role: null, isOwner: false };
  }

  // Owner has full WRITE access
  if (house.userId === userId) {
    return { hasAccess: true, role: 'WRITE', isOwner: true };
  }

  // Check if user has shared access
  const share = await context.prisma.houseShare.findUnique({
    where: {
      houseId_userId: {
        houseId,
        userId,
      },
    },
  });

  if (!share) {
    return { hasAccess: false, role: null, isOwner: false };
  }

  // If write access is required but user only has read access
  if (requireWrite && share.role === 'READ') {
    return { hasAccess: false, role: share.role, isOwner: false };
  }

  return { hasAccess: true, role: share.role, isOwner: false };
}

/**
 * Get all houses a user has access to (owned + shared)
 * @param context GraphQL context
 * @param userId User ID
 * @returns Array of houses with role information
 */
export async function getUserHouses(context: Context, userId: string) {
  // Get owned houses
  const ownedHouses = await context.prisma.house.findMany({
    where: { userId },
    include: {
      user: true,
      inventory: true,
    },
  });

  // Get shared houses
  const shares = await context.prisma.houseShare.findMany({
    where: { userId },
    include: {
      user: true,
    },
  });

  const sharedHouseIds = shares.map(s => s.houseId);
  
  const sharedHouses = sharedHouseIds.length > 0
    ? await context.prisma.house.findMany({
        where: {
          id: { in: sharedHouseIds },
        },
        include: {
          user: true,
          inventory: true,
        },
      })
    : [];

  // Combine and add role information
  const allHouses = [
    ...ownedHouses.map(house => ({
      ...house,
      userRole: 'WRITE' as const,
      isOwner: true,
    })),
    ...sharedHouses.map(house => {
      const share = shares.find(s => s.houseId === house.id);
      return {
        ...house,
        userRole: share?.role || null,
        isOwner: false,
      };
    }),
  ];

  return allHouses;
}
