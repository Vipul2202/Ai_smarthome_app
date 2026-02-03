import { Context, requireAuth, requireHouseAccess } from '../context';
import { categorizeProductWithAI } from '../../services/ai';
import { getDefaultLocationForCategory } from '../../utils/locations';

export const inventoryResolvers = {
  Query: {
    inventoryItems: async (_: any, { houseId }: any, context: Context) => {
      try {
        // Check authentication first
        const user = requireAuth(context);
        
        // Verify house access with better error handling
        const house = await context.prisma.house.findFirst({
          where: {
            id: houseId,
            userId: user.id,
          },
        });

        if (!house) {
          throw new Error(`House not found or access denied for house ID: ${houseId}`);
        }
        
        // Optimized query with selective fields and proper indexing
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

        console.log(`✅ Found ${items.length} inventory items for house ${houseId}`);
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
              },
            },
          },
        });

        if (!item) {
          throw new Error('Inventory item not found');
        }

        // Check if user owns the house
        if (item.house.userId !== user.id) {
          throw new Error('Access denied to this inventory item');
        }

        // Return item without the house relation
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
        
        // Verify house access
        const house = await context.prisma.house.findFirst({
          where: {
            id: houseId,
            userId: user.id,
          },
        });

        if (!house) {
          throw new Error(`House not found or access denied for house ID: ${houseId}`);
        }

        // Auto-categorize if no category provided
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

        // Ensure category is properly set
        if (!category) {
          category = 'other';
        }

        // Set default location if not provided
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

    // New bulk create mutation for better performance
    createInventoryItems: async (_: any, { input }: any, context: Context) => {
      try {
        const { houseId, items } = input;
        const user = requireAuth(context);
        
        // Verify house access
        const house = await context.prisma.house.findFirst({
          where: {
            id: houseId,
            userId: user.id,
          },
        });

        if (!house) {
          throw new Error(`House not found or access denied for house ID: ${houseId}`);
        }

        // Process items in parallel for categorization
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

        // Bulk insert for better performance
        const createdItems = await context.prisma.inventoryItem.createMany({
          data: processedItems,
          skipDuplicates: true,
        });

        // Return the created items (need to fetch them since createMany doesn't return data)
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
        // Optimized single query with proper access control
        const updatedItem = await context.prisma.inventoryItem.update({
          where: { 
            id,
            house: {
              userId: user.id
            }
          },
          data: {
            ...input,
            updatedAt: new Date(), // Ensure updatedAt is set
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
        throw new Error('Failed to update inventory item');
      }
    },

    deleteInventoryItem: async (_: any, { id }: any, context: Context) => {
      const user = requireAuth(context);
      
      try {
        // Optimized single query - delete with access control
        await context.prisma.inventoryItem.delete({
          where: { 
            id,
            house: {
              userId: user.id
            }
          },
        });
        return true;
      } catch (error: any) {
        if (error.code === 'P2025') {
          throw new Error('Inventory item not found or access denied');
        }
        console.error('Error deleting inventory item:', error);
        throw new Error('Failed to delete inventory item');
      }
    },
  },
};