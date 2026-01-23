import { prisma } from '../lib/prisma';

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
    const searchLower = searchTerm.toLowerCase();
    
    // Search by name (exact match)
    const exactNameMatch = await prisma.inventoryItem.findMany({
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

    // Search by name (partial match)
    const partialNameMatch = await prisma.inventoryItem.findMany({
      where: {
        kitchenId,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        NOT: {
          id: { in: exactNameMatch.map(item => item.id) },
        },
      },
      include: {
        batches: {
          where: { status: 'ACTIVE' },
        },
      },
      take: limit - exactNameMatch.length,
    });

    // Search by category (case-insensitive string search)
    const categoryMatch = await prisma.inventoryItem.findMany({
      where: {
        kitchenId,
        category: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        NOT: {
          id: { in: [...exactNameMatch, ...partialNameMatch].map(item => item.id) },
        },
      },
      include: {
        batches: {
          where: { status: 'ACTIVE' },
        },
      },
      take: Math.max(1, limit - exactNameMatch.length - partialNameMatch.length),
    });

    // Search by location (enum field - need to match exact enum values)
    const locationSearchUpper = searchTerm.toUpperCase();
    const validLocations = ['PANTRY', 'FRIDGE', 'FREEZER', 'CONTAINER', 'CABINET'];
    const matchingLocations = validLocations.filter(loc => 
      loc.includes(locationSearchUpper) || locationSearchUpper.includes(loc)
    );

    let locationMatch: any[] = [];
    if (matchingLocations.length > 0) {
      locationMatch = await prisma.inventoryItem.findMany({
        where: {
          kitchenId,
          location: {
            in: matchingLocations as any[],
          },
          NOT: {
            id: { in: [...exactNameMatch, ...partialNameMatch, ...categoryMatch].map(item => item.id) },
          },
        },
        include: {
          batches: {
            where: { status: 'ACTIVE' },
          },
        },
        take: Math.max(1, limit - exactNameMatch.length - partialNameMatch.length - categoryMatch.length),
      });
    }

    // Combine all results
    const allResults = [...exactNameMatch, ...partialNameMatch, ...categoryMatch, ...locationMatch];
    
    return allResults.map(item => {
      const totalQuantity = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);
      
      // Calculate similarity score based on what matched
      const nameLower = item.name.toLowerCase();
      const categoryLower = item.category.toLowerCase();
      const locationLower = item.location.toLowerCase();
      
      let similarity = 0;
      let matchType = '';
      
      // Name matches (highest priority)
      if (nameLower === searchLower) {
        similarity = 1.0;
        matchType = 'name-exact';
      } else if (nameLower.includes(searchLower)) {
        similarity = 0.9;
        matchType = 'name-partial';
      } else if (searchLower.includes(nameLower)) {
        similarity = 0.8;
        matchType = 'name-contains';
      }
      // Category matches (medium priority)
      else if (categoryLower === searchLower) {
        similarity = 0.7;
        matchType = 'category-exact';
      } else if (categoryLower.includes(searchLower)) {
        similarity = 0.6;
        matchType = 'category-partial';
      }
      // Location matches (lower priority)
      else if (locationLower === searchLower) {
        similarity = 0.5;
        matchType = 'location-exact';
      } else if (locationLower.includes(searchLower)) {
        similarity = 0.4;
        matchType = 'location-partial';
      }
      // Fallback: character overlap
      else {
        const nameOverlap = [...searchLower].filter(char => nameLower.includes(char)).length;
        const categoryOverlap = [...searchLower].filter(char => categoryLower.includes(char)).length;
        const locationOverlap = [...searchLower].filter(char => locationLower.includes(char)).length;
        
        const maxOverlap = Math.max(nameOverlap, categoryOverlap, locationOverlap);
        similarity = maxOverlap / Math.max(searchLower.length, nameLower.length);
        matchType = 'fuzzy';
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