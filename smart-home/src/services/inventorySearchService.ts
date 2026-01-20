import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  defaultUnit: string;
  location: string;
  similarity: number;
}

export async function searchInventoryItems(
  kitchenId: string,
  searchTerm: string,
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    // First try exact match
    const exactMatch = await prisma.inventoryItem.findMany({
      where: {
        kitchenId,
        name: {
          equals: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        batches: {
          where: { status: 'ACTIVE' },
        },
      },
      take: limit,
    });

    // Then try partial match
    const partialMatch = await prisma.inventoryItem.findMany({
      where: {
        kitchenId,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        NOT: {
          id: { in: exactMatch.map(item => item.id) },
        },
      },
      include: {
        batches: {
          where: { status: 'ACTIVE' },
        },
      },
      take: limit - exactMatch.length,
    });

    // Combine and calculate similarity scores
    const allResults = [...exactMatch, ...partialMatch];
    
    return allResults.map(item => {
      const totalQuantity = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);
      
      // Calculate similarity score
      const nameLower = item.name.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      let similarity = 0;
      if (nameLower === searchLower) {
        similarity = 1.0;
      } else if (nameLower.includes(searchLower)) {
        similarity = 0.8;
      } else if (searchLower.includes(nameLower)) {
        similarity = 0.7;
      } else {
        // Simple character overlap calculation
        const overlap = [...searchLower].filter(char => nameLower.includes(char)).length;
        similarity = overlap / Math.max(searchLower.length, nameLower.length);
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        totalQuantity,
        defaultUnit: item.defaultUnit,
        location: item.location,
        similarity,
      };
    }).sort((a, b) => b.similarity - a.similarity);

  } catch (error) {
    console.error('Error searching inventory:', error);
    return [];
  }
}

export async function findExactItem(
  kitchenId: string,
  itemName: string
): Promise<SearchResult | null> {
  try {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        kitchenId,
        name: {
          equals: itemName,
          mode: 'insensitive',
        },
      },
      include: {
        batches: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!item) return null;

    const totalQuantity = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      totalQuantity,
      defaultUnit: item.defaultUnit,
      location: item.location,
      similarity: 1.0,
    };

  } catch (error) {
    console.error('Error finding exact item:', error);
    return null;
  }
}