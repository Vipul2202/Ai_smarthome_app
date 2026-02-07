import { Context, requireAuth, requireHouseAccess } from '../context';
import { categorizeProductWithAI } from '../../services/ai';
import { getDefaultLocationForCategory } from '../../utils/locations';

// Helper function to check house access with role
async function checkHouseAccess(
  context: Context,
  houseId: string,
  userId: string,
  requireWrite: boolean = false
): Promise<{ hasAccess: boolean; role: 'READ' | 'WRITE' | null }> {
  const house = await context.prisma.house.findFirst({
    where: {
      id: houseId,
      OR: [
        { userId },
        { shares: { some: { userId } } },
      ],
    },
    include: {
      shares: {
        where: { userId },
      },
    },
  });

  if (!house) {
    return { hasAccess: false, role: null };
  }

  // Owner has WRITE access
  if (house.userId === userId) {
    return { hasAccess: true, role: 'WRITE' };
  }

  // Check shared access
  const share = house.shares[0];
  if (!share) {
    return { hasAccess: false, role: null };
  }

  if (requireWrite && share.role === 'READ') {
    return { hasAccess: false, role: share.role };
  }

  return { hasAccess: true, role: share.role };
}

export const inventoryResolvers = {
  Query: {
    inventoryItems: async (_: any, { houseId }: any, context: Context) => {
      try {
        const user = requireAuth(context);
        
        const access = await checkHouseAccess(context, houseId, user.id, false);
        if (!access.hasAccess) {
          throw new Error(`House not found or access denied for house ID: ${houseId}`);
        }
        
        const items = await context.prisma.inventoryItem.findMany({
          where: { houseId },
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            quantity: true,
            unit: true,
            imageUrl: true,
            barcode: true,
            description: true,
            expiryDate: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [
            { updatedAt: 'desc' },
            { name: 'asc' }
          ],
        });

        console.log(`✅ Found ${items.length} inventory items for house ${houseId} (role: ${access.role})`);
        return items;
      } catch (error) {
        console.error('Error in inventoryItems query:', error);
        throw error;
      }
    },

    inventoryItem: async (_: any, { id }: any, context: Context) => {
      try {
        const user = requireAuth(context);
        
        const item = await context.prisma.inventoryItem.findUnique({
          where: { id },
          include: {
            house: {
              select: {
                userId: true,
                id: true,
              },
            },
          },
        });

        if (!item) {
          throw new Error('Inventory item not found');
        }

        const access = await checkHouseAccess(context, item.house.id, user.id, false);
        if (!access.hasAccess) {
          throw new Error('Access denied to this inventory item');
        }

        const { house, ...itemData } = item;
        return itemData;
      } catch (error) {
        console.error('Error in inventoryItem query:', error);
        throw error;
      }
    },
  },

  Mutation: {
    createInventoryItem: async (_: any, { input }: any, context: Context) => {
      try {
        const { houseId, ...itemData } = input;
        const user = requireAuth(context);
        
        const access = await checkHouseAccess(context, houseId, user.id, true);
        if (!access.hasAccess) {
          throw new Error(`House not found or access denied for house ID: ${houseId}`);
        }
        if (access.role === 'READ') {
          throw new Error('You only have read access to this house');
        }

        let category = itemData.category;
        if (!category && itemData.name) {
          try {
            const categoryResult = await categorizeProductWithAI(itemData.name);
            category = categoryResult.category;
            console.log(`Auto-categorized "${itemData.name}" as "${category}" (confidence: ${categoryResult.confidence})`);
          } catch (error) {
            console.error('Auto-categorization failed:', error);
            category = 'other';
          }
        }

        if (!category) {
          category = 'other';
        }

        const location = itemData.location || getDefaultLocationForCategory(category);

        const newItem = await context.prisma.inventoryItem.create({
          data: {
            ...itemData,
            category,
            location,
            houseId,
          },
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            quantity: true,
            unit: true,
            imageUrl: true,
            barcode: true,
            description: true,
            expiryDate: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        console.log(`✅ Created inventory item: ${newItem.name}`);
        return newItem;
      } catch (error) {
        console.error('Error creating inventory item:', error);
        throw error;
      }
    },

    createInventoryItems: async (_: any, { input }: any, context: Context) => {
      try {
        const { houseId, items } = input;
        const user = requireAuth(context);
        
        const access = await checkHouseAccess(context, houseId, user.id, true);
        if (!access.hasAccess) {
          throw new Error(`House not found or access denied for house ID: ${houseId}`);
        }
        if (access.role === 'READ') {
          throw new Error('You only have read access to this house');
        }

        const processedItems = await Promise.all(
          items.map(async (item: any) => {
            let category = item.category;
            if (!category && item.name) {
              try {
                const categoryResult = await categorizeProductWithAI(item.name);
                category = categoryResult.category;
              } catch (error) {
                console.error(`Auto-categorization failed for "${item.name}":`, error);
                category = 'other';
              }
            }

            return {
              ...item,
              category,
              location: item.location || getDefaultLocationForCategory(category),
              houseId,
            };
          })
        );

        const createdItems = await context.prisma.inventoryItem.createMany({
          data: processedItems,
          skipDuplicates: true,
        });

        const items_created = await context.prisma.inventoryItem.findMany({
          where: {
            houseId,
            name: { in: items.map((item: any) => item.name) },
          },
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            quantity: true,
            unit: true,
            imageUrl: true,
            barcode: true,
            description: true,
            expiryDate: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: items.length,
        });

        console.log(`✅ Created ${createdItems.count} inventory items`);
        return {
          count: createdItems.count,
          items: items_created,
        };
      } catch (error) {
        console.error('Error creating bulk inventory items:', error);
        throw error;
      }
    },

    updateInventoryItem: async (_: any, { id, input }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        const item = await context.prisma.inventoryItem.findUnique({
          where: { id },
          select: { houseId: true },
        });

        if (!item) {
          throw new Error('Inventory item not found');
        }

        const access = await checkHouseAccess(context, item.houseId, user.id, true);
        if (!access.hasAccess) {
          throw new Error('Inventory item not found or access denied');
        }
        if (access.role === 'READ') {
          throw new Error('You only have read access to this house');
        }

        const updatedItem = await context.prisma.inventoryItem.update({
          where: { id },
          data: {
            ...input,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            category: true,
            quantity: true,
            unit: true,
            location: true,
            expiryDate: true,
            createdAt: true,
            updatedAt: true,
            houseId: true,
          },
        });
        
        return updatedItem;
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new Error('Inventory item not found or access denied');
        }
        if (error.code === 'P2002') {
          throw new Error('An item with this name already exists in this location');
        }
        console.error('Error updating inventory item:', error);
        throw error;
      }
    },

    deleteInventoryItem: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        const item = await context.prisma.inventoryItem.findUnique({
          where: { id },
          select: { houseId: true },
        });

        if (!item) {
          throw new Error('Inventory item not found');
        }

        const access = await checkHouseAccess(context, item.houseId, user.id, true);
        if (!access.hasAccess) {
          throw new Error('Inventory item not found or access denied');
        }
        if (access.role === 'READ') {
          throw new Error('You only have read access to this house');
        }

        await context.prisma.inventoryItem.delete({
          where: { id },
        });
        return true;
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new Error('Inventory item not found or access denied');
        }
        console.error('Error deleting inventory item:', error);
        throw error;
      }
    },
  },
};