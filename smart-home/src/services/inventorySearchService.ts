import { prisma } from '../lib/prisma';

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  similarity: number;
}

export async function searchInventoryItems(
  houseId: string,
  searchTerm: string,
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    const searchLower = searchTerm.toLowerCase().trim();
    
    if (!searchLower || searchLower.length < 2) {
      return [];
    }
    
    // Tokenize search term for better matching
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    
    // Build comprehensive search query with OR conditions
    const searchConditions = [];
    
    // Exact name match (highest priority)
    searchConditions.push({
      name: {
        equals: searchTerm,
        mode: 'insensitive' as const,
      },
    });
    
    // Partial name match - handle compound words better
    searchConditions.push({
      name: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    });
    
    // Handle compound words like "water bottle" -> "waterbottle", "water_bottle", etc.
    const compoundWord = searchWords.join('');
    if (compoundWord !== searchLower) {
      searchConditions.push({
        name: {
          contains: compoundWord,
          mode: 'insensitive' as const,
        },
      });
    }
    
    const underscoreWord = searchWords.join('_');
    if (underscoreWord !== searchLower) {
      searchConditions.push({
        name: {
          contains: underscoreWord,
          mode: 'insensitive' as const,
        },
      });
    }
    
    const dashWord = searchWords.join('-');
    if (dashWord !== searchLower) {
      searchConditions.push({
        name: {
          contains: dashWord,
          mode: 'insensitive' as const,
        },
      });
    }
    
    // Multi-word matching - ANY word should be in the name (changed from AND to OR)
    if (searchWords.length > 1) {
      searchConditions.push({
        OR: searchWords.map(word => ({
          name: {
            contains: word,
            mode: 'insensitive' as const,
          },
        })),
      });
    }
    
    // Individual word matching for longer words
    searchWords.forEach(word => {
      if (word.length > 2) {
        searchConditions.push({
          name: {
            contains: word,
            mode: 'insensitive' as const,
          },
        });
      }
    });
    
    // Category matching
    searchConditions.push({
      category: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    });
    
    // Location matching
    searchConditions.push({
      location: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    });
    
    // Optimized single query with proper ordering
    const results = await prisma.inventoryItem.findMany({
      where: {
        houseId,
        OR: searchConditions,
      },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        unit: true,
        location: true,
        createdAt: true,
      },
      orderBy: [
        // Prioritize exact matches first
        { name: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit, // Don't over-fetch
    });
    
    // Calculate similarity scores and return results
    return results.map(item => {
      const similarity = calculateSimilarity(searchTerm, item.name, item.category, item.location);
      return {
        id: item.id,
        name: item.name,
        category: item.category || 'other',
        quantity: item.quantity,
        unit: item.unit,
        location: item.location || 'unknown',
        similarity,
      };
    }).sort((a, b) => b.similarity - a.similarity);
    
  } catch (error) {
    console.error('Error searching inventory items:', error);
    return [];
  }
}

// Improved similarity calculation with fuzzy matching
function calculateSimilarity(searchTerm: string, name: string, category?: string, location?: string): number {
  const searchLower = searchTerm.toLowerCase().trim();
  const nameLower = (name || '').toLowerCase();
  const categoryLower = (category || '').toLowerCase();
  const locationLower = (location || '').toLowerCase();
  
  let similarity = 0;
  
  // Exact name match (highest score)
  if (nameLower === searchLower) {
    return 1.0;
  }
  
  // Check if search term is contained in name
  if (nameLower.includes(searchLower)) {
    similarity = Math.max(similarity, 0.9);
  }
  
  // Check if name is contained in search term
  if (searchLower.includes(nameLower)) {
    similarity = Math.max(similarity, 0.85);
  }
  
  // Multi-word matching - check if all words in search are in name
  const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
  const nameWords = nameLower.split(/\s+/).filter(word => word.length > 0);
  
  if (searchWords.length > 1) {
    const matchedWords = searchWords.filter(searchWord => 
      nameWords.some(nameWord => 
        nameWord.includes(searchWord) || searchWord.includes(nameWord)
      )
    );
    
    if (matchedWords.length === searchWords.length) {
      similarity = Math.max(similarity, 0.8);
    } else if (matchedWords.length > 0) {
      similarity = Math.max(similarity, 0.6 * (matchedWords.length / searchWords.length));
    }
  }
  
  // Individual word matching
  searchWords.forEach(searchWord => {
    if (searchWord.length > 2) {
      nameWords.forEach(nameWord => {
        if (nameWord.includes(searchWord) || searchWord.includes(nameWord)) {
          similarity = Math.max(similarity, 0.5);
        }
        // Fuzzy matching for similar words
        if (levenshteinDistance(searchWord, nameWord) <= 2 && searchWord.length > 3) {
          similarity = Math.max(similarity, 0.4);
        }
      });
    }
  });
  
  // Category matching
  if (categoryLower === searchLower) {
    similarity = Math.max(similarity, 0.7);
  } else if (categoryLower.includes(searchLower) || searchLower.includes(categoryLower)) {
    similarity = Math.max(similarity, 0.6);
  }
  
  // Location matching
  if (locationLower === searchLower) {
    similarity = Math.max(similarity, 0.5);
  } else if (locationLower.includes(searchLower) || searchLower.includes(locationLower)) {
    similarity = Math.max(similarity, 0.4);
  }
  
  return similarity;
}

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export async function findExactItem(
  houseId: string,
  itemName: string
): Promise<SearchResult | null> {
  try {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        houseId,
        name: {
          equals: itemName,
          mode: 'insensitive',
        },
      },
    });

    if (!item) return null;

    return {
      id: item.id,
      name: item.name,
      category: item.category || 'other',
      quantity: item.quantity,
      unit: item.unit,
      location: item.location || 'unknown',
      similarity: 1.0,
    };

  } catch (error) {
    console.error('Error finding exact item:', error);
    return null;
  }
}