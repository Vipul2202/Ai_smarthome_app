import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseInventoryProps {
  kitchenId?: string;
}

export const useInventory = ({ kitchenId }: UseInventoryProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'quantity'>('name');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get or create user's kitchen for the selected house
  const getOrCreateKitchen = async (token: string, apiUrl: string): Promise<string | null> => {
    try {
      // Get selected house (if any)
      const selectedHouseId = await AsyncStorage.getItem('selectedHouseId');
      const selectedHouseName = await AsyncStorage.getItem('selectedHouseName');
      
      console.log('🏠 Selected house:', selectedHouseName, selectedHouseId);

      if (!selectedHouseId || !selectedHouseName) {
        console.error('No house selected');
        return null;
      }

      // Check if we have a cached kitchen ID for this house
      const cachedKitchenKey = `kitchen_${selectedHouseId}`;
      const cachedKitchenId = await AsyncStorage.getItem(cachedKitchenKey);
      
      if (cachedKitchenId) {
        console.log('✅ Using cached kitchen ID:', cachedKitchenId);
        return cachedKitchenId;
      }

      // First, try to get user's households
      const householdsResponse = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetHouseholds {
              households {
                id
                name
                kitchens {
                  id
                  name
                }
              }
            }
          `,
        }),
      });

      const householdsData = await householdsResponse.json();
      console.log('🏠 Households response:', JSON.stringify(householdsData, null, 2));

      // Check if a household exists for this house (by matching name)
      const existingHousehold = householdsData.data?.households?.find(
        (h: any) => h.name === selectedHouseName
      );

      if (existingHousehold?.kitchens?.[0]?.id) {
        const kitchenId = existingHousehold.kitchens[0].id;
        console.log('✅ Using existing kitchen for house:', kitchenId);
        // Cache the kitchen ID
        await AsyncStorage.setItem(cachedKitchenKey, kitchenId);
        return kitchenId;
      }

      // If no household exists for this house, create one
      let householdId = existingHousehold?.id;
      
      if (!householdId) {
        console.log('📝 Creating new household for house:', selectedHouseName);
        const createHouseholdResponse = await fetch(`${apiUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              mutation CreateHousehold($input: CreateHouseholdInput!) {
                createHousehold(input: $input) {
                  id
                  name
                }
              }
            `,
            variables: {
              input: {
                name: selectedHouseName,
                description: `Household for ${selectedHouseName}`,
              },
            },
          }),
        });

        const householdData = await createHouseholdResponse.json();
        console.log('🏠 Create household response:', JSON.stringify(householdData, null, 2));
        
        if (householdData.data?.createHousehold?.id) {
          householdId = householdData.data.createHousehold.id;
        } else {
          console.error('Failed to create household');
          return null;
        }
      }

      // Create a kitchen in the household
      console.log('🍳 Creating new kitchen for house...');
      const createKitchenResponse = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateKitchen($input: CreateKitchenInput!) {
              createKitchen(input: $input) {
                id
                name
              }
            }
          `,
          variables: {
            input: {
              householdId: householdId,
              name: `${selectedHouseName} Kitchen`,
              description: `Main kitchen for ${selectedHouseName}`,
              type: 'HOME',
            },
          },
        }),
      });

      const kitchenData = await createKitchenResponse.json();
      console.log('🍳 Create kitchen response:', JSON.stringify(kitchenData, null, 2));

      if (kitchenData.data?.createKitchen?.id) {
        const newKitchenId = kitchenData.data.createKitchen.id;
        console.log('✅ Created new kitchen:', newKitchenId);
        // Cache the kitchen ID for this house
        await AsyncStorage.setItem(cachedKitchenKey, newKitchenId);
        return newKitchenId;
      }

      return null;
    } catch (error) {
      console.error('Error getting/creating kitchen:', error);
      return null;
    }
  };

  // Fetch inventory items from backend
  const fetchInventoryItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.log('No auth token, skipping inventory fetch');
        setInventoryItems([]);
        return;
      }

      // Get or create kitchen
      const actualKitchenId = kitchenId || await getOrCreateKitchen(token, apiUrl);
      
      if (!actualKitchenId) {
        console.error('No kitchen available');
        setInventoryItems([]);
        return;
      }

      console.log('📦 Fetching inventory for kitchen:', actualKitchenId);

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetInventoryItems($kitchenId: ID!) {
              inventoryItems(kitchenId: $kitchenId) {
                id
                name
                category
                defaultUnit
                location
                totalQuantity
                status
                nextExpiry
                createdAt
                updatedAt
                batches {
                  id
                  quantity
                  unit
                  status
                }
              }
            }
          `,
          variables: { kitchenId: actualKitchenId },
        }),
      });

      const data = await response.json();
      
      // Check for errors first
      if (data.errors) {
        console.log('⚠️ Database connection issue - using empty inventory');
        setInventoryItems([]);
        return;
      }

      console.log('📦 Inventory response:', JSON.stringify(data, null, 2));

      if (data.data?.inventoryItems) {
        const items: InventoryItem[] = data.data.inventoryItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category ? item.category.toLowerCase() : null,
          quantity: item.totalQuantity || 0,
          unit: item.defaultUnit || 'pieces',
          expiryDate: item.nextExpiry,
          status: item.status?.toLowerCase() || 'good',
          location: item.location?.toLowerCase(),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setInventoryItems(items);
      } else {
        setInventoryItems([]);
      }
    } catch (error) {
      console.log('⚠️ Error fetching inventory - database may be unavailable');
      setInventoryItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount and when kitchenId changes
  useEffect(() => {
    fetchInventoryItems();
  }, [kitchenId]);

  // Filter and sort items
  const filteredItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

  // Get items by status
  const itemsByStatus = {
    good: inventoryItems.filter(item => item.status === 'good'),
    warning: inventoryItems.filter(item => item.status === 'warning'),
    critical: inventoryItems.filter(item => item.status === 'critical'),
  };

  // Get expiring items (next 7 days)
  const expiringItems = inventoryItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const now = new Date();
    const diffInDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7 && diffInDays >= 0;
  });

  // Get low stock items
  const lowStockItems = inventoryItems.filter(item => item.quantity <= 2);

  // Categories
  const categories = ['All', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

  const getItem = async (id: string): Promise<InventoryItem | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.error('No auth token');
        return null;
      }

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetInventoryItem($id: ID!) {
              inventoryItem(id: $id) {
                id
                name
                category
                defaultUnit
                location
                totalQuantity
                status
                nextExpiry
                createdAt
                updatedAt
                batches {
                  id
                  quantity
                  unit
                  status
                }
              }
            }
          `,
          variables: { id },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return null;
      }

      if (data.data?.inventoryItem) {
        const item = data.data.inventoryItem;
        return {
          id: item.id,
          name: item.name,
          category: item.category ? item.category.toLowerCase() : null,
          quantity: item.totalQuantity || 0,
          unit: item.defaultUnit || 'pieces',
          expiryDate: item.nextExpiry,
          status: item.status?.toLowerCase() || 'good',
          location: item.location?.toLowerCase(),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching item:', error);
      return null;
    }
  };

  const addItem = async (itemData: Partial<InventoryItem>) => {
    try {
      setAddingItem(true);
      
      // Validate required fields
      if (!itemData.name || !itemData.name.trim()) {
        return { success: false, error: 'Product name is required' };
      }
      
      if (!itemData.category) {
        return { success: false, error: 'Category is required. Please wait for AI to categorize the product or select manually.' };
      }
      
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      // Get or create kitchen
      const actualKitchenId = kitchenId || await getOrCreateKitchen(token, apiUrl);
      
      if (!actualKitchenId) {
        console.error('No kitchen available');
        return { success: false, error: 'No kitchen available' };
      }

      console.log('➕ Adding item to kitchen:', actualKitchenId);

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
              createInventoryItem(input: $input) {
                id
                name
                category
                defaultUnit
                totalQuantity
                status
                createdAt
              }
            }
          `,
          variables: {
            input: {
              kitchenId: actualKitchenId,
              name: itemData.name.trim(),
              category: (itemData.category || 'other').toUpperCase(),
              defaultUnit: itemData.unit || 'pieces',
              location: 'PANTRY',
              threshold: 2,
              tags: [],
            },
          },
        }),
      });

      const data = await response.json();
      console.log('➕ Add item response:', JSON.stringify(data, null, 2));

      if (data.data?.createInventoryItem) {
        // Now add a batch for the quantity
        const itemId = data.data.createInventoryItem.id;
        
        const batchResponse = await fetch(`${apiUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              mutation CreateInventoryBatch($input: CreateInventoryBatchInput!) {
                createInventoryBatch(input: $input) {
                  id
                  quantity
                  unit
                }
              }
            `,
            variables: {
              input: {
                itemId: itemId,
                quantity: itemData.quantity || 1,
                unit: itemData.unit || 'pieces',
                purchaseDate: new Date().toISOString(),
              },
            },
          }),
        });

        const batchData = await batchResponse.json();
        console.log('📦 Add batch response:', JSON.stringify(batchData, null, 2));

        // Refresh inventory
        await fetchInventoryItems();
        return { success: true };
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return { success: false, error: data.errors[0]?.message };
      }
      
      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Error adding item:', error);
      return { success: false, error };
    } finally {
      setAddingItem(false);
    }
  };

  const updateItem = async (id: string, itemData: Partial<InventoryItem>) => {
    try {
      setUpdatingItem(true);
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('✏️ Updating item:', id, itemData);

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateInventoryItem($id: ID!, $input: UpdateInventoryItemInput!) {
              updateInventoryItem(id: $id, input: $input) {
                id
                name
                category
                defaultUnit
                totalQuantity
                updatedAt
              }
            }
          `,
          variables: {
            id,
            input: {
              name: itemData.name,
              category: itemData.category ? itemData.category.toUpperCase() : undefined,
              defaultUnit: itemData.unit,
            },
          },
        }),
      });

      const data = await response.json();
      console.log('✏️ Update item response:', JSON.stringify(data, null, 2));

      if (data.data?.updateInventoryItem) {
        // Refresh inventory to get updated data
        await fetchInventoryItems();
        return { success: true };
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return { success: false, error: data.errors[0]?.message };
      }
      
      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error };
    } finally {
      setUpdatingItem(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setDeletingItem(true);
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteInventoryItem($id: ID!) {
              deleteInventoryItem(id: $id)
            }
          `,
          variables: { id },
        }),
      });

      const data = await response.json();
      console.log('🗑️ Delete item response:', JSON.stringify(data, null, 2));

      if (data.data?.deleteInventoryItem) {
        // Refresh inventory
        await fetchInventoryItems();
        return { success: true };
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return { success: false, error: data.errors[0]?.message };
      }
      
      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error };
    } finally {
      setDeletingItem(false);
    }
  };

  const refetch = async () => {
    await fetchInventoryItems(true);
  };

  const searchItems = (query: string) => {
    setSearchQuery(query);
  };

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const sortItems = (sortType: 'name' | 'expiry' | 'quantity') => {
    setSortBy(sortType);
  };

  return {
    // Data
    items: filteredItems,
    allItems: inventoryItems,
    itemsByStatus,
    expiringItems,
    lowStockItems,
    categories,
    
    // State
    searchQuery,
    selectedCategory,
    sortBy,
    loading,
    error: null, // Mock: no errors for now
    
    // Loading states
    addingItem,
    updatingItem,
    deletingItem,
    refreshing,
    
    // Actions
    addItem,
    updateItem,
    deleteItem,
    getItem,
    searchItems,
    filterByCategory,
    sortItems,
    refetch,
    
    // Setters
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
  };
};