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
    const searchLower = searchTerm.toLowerCase().trim();
    
    if (!searchLower) {
      return [];
    }

    // Use a single optimized query with OR conditions and proper indexing
    const items = await prisma.inventoryItem.findMany({
      where: {
        kitchenId,
        OR: [
          // Exact name match (highest priority)
          {
            name: {
              equals: searchTerm,
              mode: 'insensitive',
            },
          },
          // Name contains search term
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          // Category contains search term
          {
            category: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          // Location matches (enum field)
          ...(isValidLocation(searchTerm.toUpperCase()) ? [{
            location: searchTerm.toUpperCase() as any,
          }] : []),
          // Brand contains search term
          {
            brand: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          // Tags contain search term
          {
            tags: {
              has: searchTerm,
            },
          },
        ],
      },
      include: {
        batches: {
          where: { status: 'ACTIVE' },
          select: {
            quantity: true,
            unit: true,
          },
        },
      },
      take: limit * 2, // Get more results for better sorting
      orderBy: [
        { name: 'asc' },
        { category: 'asc' },
      ],
    });

    // Calculate similarity scores and total quantities
    const results: SearchResult[] = items.map(item => {
      const totalQuantity = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);
      const similarity = calculateSimilarity(searchLower, item);
      
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        totalQuantity,
        defaultUnit: item.defaultUnit,
        location: item.location,
        similarity,
      };
    });

    // Sort by similarity (descending) and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

  } catch (error) {
    console.error('Error searching inventory items:', error);
    return [];
  }
}

function isValidLocation(location: string): boolean {
  const validLocations = ['PANTRY', 'FRIDGE', 'FREEZER', 'CONTAINER', 'CABINET'];
  return validLocations.includes(location);
}

function calculateSimilarity(searchTerm: string, item: any): number {
  const searchLower = searchTerm.toLowerCase();
  const nameLower = item.name.toLowerCase();
  const categoryLower = item.category.toLowerCase();
  const locationLower = item.location.toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();

  // Exact name match
  if (nameLower === searchLower) return 1.0;
  
  // Name starts with search term
  if (nameLower.startsWith(searchLower)) return 0.95;
  
  // Name contains search term
  if (nameLower.includes(searchLower)) return 0.9;
  
  // Exact category match
  if (categoryLower === searchLower) return 0.8;
  
  // Category contains search term
  if (categoryLower.includes(searchLower)) return 0.75;
  
  // Brand exact match
  if (brandLower === searchLower) return 0.7;
  
  // Brand contains search term
  if (brandLower.includes(searchLower)) return 0.65;
  
  // Location match
  if (locationLower === searchLower) return 0.6;
  
  // Tags contain search term
  if (item.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))) return 0.55;
  
  // Fuzzy matching for partial matches
  const nameDistance = calculateLevenshteinDistance(searchLower, nameLower);
  const maxLength = Math.max(searchLower.length, nameLower.length);
  const nameSimilarity = 1 - (nameDistance / maxLength);
  
  if (nameSimilarity > 0.6) return nameSimilarity * 0.5;
  
  return 0.1; // Minimum similarity for any match
}

function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

export async function findExactItem(
  kitchenId: string,
  name: string,
  category?: string,
  location?: string
): Promise<any | null> {
  try {
    const whereClause: any = {
      kitchenId,
      name: {
        equals: name,
        mode: 'insensitive',
      },
    };

    if (category) {
      whereClause.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (location && isValidLocation(location.toUpperCase())) {
      whereClause.location = location.toUpperCase();
    }

    const item = await prisma.inventoryItem.findFirst({
      where: whereClause,
      include: {
        batches: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (item) {
      const totalQuantity = item.batches.reduce((sum, batch) => sum + batch.quantity, 0);
      return {
        ...item,
        totalQuantity,
      };
    }

    return null;
  } catch (error) {
    console.error('Error finding exact item:', error);
    return null;
  }
}