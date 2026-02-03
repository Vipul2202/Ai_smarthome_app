import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkManager } from '@/lib/network';
import { getDefaultLocationForCategory } from '@/utils/locations';

interface UseInventoryProps {
  houseId?: string;
}

export const useInventory = ({ houseId }: UseInventoryProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'expiry' | 'quantity'>('name');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventoryItems = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.log('❌ No auth token found - user needs to login');
        setInventoryItems([]);
        return;
      }

      console.log('🔑 Auth token found:', token.substring(0, 20) + '...');

      // Get selected house ID
      const selectedHouseId = houseId || await AsyncStorage.getItem('selectedHouseId');
      
      if (!selectedHouseId) {
        console.error('❌ No house selected - user needs to select a house');
        setInventoryItems([]);
        return;
      }

      console.log('🏠 Selected house ID:', selectedHouseId);
      console.log('📦 Fetching inventory for house:', selectedHouseId);

      // Simplified query with better error handling
      try {
        const data = await NetworkManager.makeGraphQLRequest(`
          query GetInventoryItems($houseId: ID!) {
            inventoryItems(houseId: $houseId) {
              id
              name
              category
              location
              quantity
              unit
              imageUrl
              barcode
              description
              expiryDate
              createdAt
              updatedAt
            }
          }
        `, { houseId: selectedHouseId }, token);
        
        // Set inventory items
        const items = data.data?.inventoryItems || [];
        setInventoryItems(items);
        console.log(`✅ Loaded ${items.length} inventory items successfully`);

        // Cache the data for offline access
        try {
          await AsyncStorage.setItem(`inventory_${selectedHouseId}`, JSON.stringify(items));
          await AsyncStorage.setItem(`inventory_${selectedHouseId}_timestamp`, Date.now().toString());
        } catch (cacheError) {
          console.warn('Failed to cache inventory data:', cacheError);
        }
      } catch (graphqlError) {
        console.error('❌ GraphQL Error:', graphqlError.message);
        
        // Check for specific error types
        if (graphqlError.message.includes('Authentication') || graphqlError.message.includes('unauthorized')) {
          console.log('🔑 Authentication failed - token may be expired');
          console.log('💡 Solution: Logout and login again');
        } else if (graphqlError.message.includes('House not found') || graphqlError.message.includes('access denied')) {
          console.log('🏠 House access denied - house may not belong to user');
          console.log('💡 Solution: Select a different house or check house ownership');
        } else if (graphqlError.message.includes('Network request failed: 400')) {
          console.log('📡 400 Error - likely authentication or validation issue');
          console.log('💡 Check: 1) Valid token 2) House selected 3) House ownership');
        }
        
        // Try to load from cache if GraphQL fails
        try {
          const cachedData = await AsyncStorage.getItem(`inventory_${selectedHouseId}`);
          const cacheTimestamp = await AsyncStorage.getItem(`inventory_${selectedHouseId}_timestamp`);
          
          if (cachedData && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            // Use cache if less than 1 hour old
            if (cacheAge < 60 * 60 * 1000) {
              const cachedItems = JSON.parse(cachedData);
              setInventoryItems(cachedItems);
              console.log(`📦 Loaded ${cachedItems.length} items from cache (GraphQL failed)`);
              return;
            }
          }
        } catch (cacheError) {
          console.warn('Failed to load from cache:', cacheError);
        }
        
        throw graphqlError; // Re-throw to be caught by outer catch
      }

    } catch (error: any) {
      console.error('❌ Error fetching inventory:', error.message);
      console.log('🔍 Debug info:');
      console.log('- API URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('- Error type:', error.constructor.name);
      console.log('- Full error:', error);
      
      // Try to load from cache as last resort
      try {
        const selectedHouseId = houseId || await AsyncStorage.getItem('selectedHouseId');
        if (selectedHouseId) {
          const cachedData = await AsyncStorage.getItem(`inventory_${selectedHouseId}`);
          if (cachedData) {
            const cachedItems = JSON.parse(cachedData);
            setInventoryItems(cachedItems);
            console.log(`📦 Loaded ${cachedItems.length} items from cache (fallback)`);
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Failed to load from cache:', cacheError);
      }
      
      setInventoryItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount and when houseId changes
  useEffect(() => {
    fetchInventoryItems();
  }, [houseId]);

  // Filter and sort items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'quantity':
        return b.quantity - a.quantity;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getItem = async (id: string): Promise<InventoryItem | null> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;

      const data = await NetworkManager.makeGraphQLRequest(`
        query GetInventoryItem($id: ID!) {
          inventoryItem(id: $id) {
            id
            name
            category
            location
            quantity
            unit
            imageUrl
            barcode
            description
            createdAt
            updatedAt
          }
        }
      `, { id }, token);

      return data.data?.inventoryItem || null;
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
      
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      // Get selected house ID
      const selectedHouseId = houseId || await AsyncStorage.getItem('selectedHouseId');
      
      if (!selectedHouseId) {
        console.error('No house selected');
        return { success: false, error: 'No house selected' };
      }

      console.log('➕ Adding item to house:', selectedHouseId, 'with data:', itemData);

      const data = await NetworkManager.makeGraphQLRequest(`
        mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
          createInventoryItem(input: $input) {
            id
            name
            category
            location
            quantity
            unit
            imageUrl
            barcode
            description
            createdAt
            updatedAt
          }
        }
      `, {
        input: {
          houseId: selectedHouseId,
          name: itemData.name.trim(),
          category: itemData.category || null,
          location: itemData.location || getDefaultLocationForCategory(itemData.category),
          quantity: itemData.quantity || 1,
          unit: itemData.unit || 'pieces',
          imageUrl: itemData.imageUrl || null,
          barcode: itemData.barcode || null,
          description: itemData.description || null,
        },
      }, token);

      console.log('➕ Add item response:', JSON.stringify(data, null, 2));

      if (data.data?.createInventoryItem) {
        // Add to local state immediately for better UX
        const newItem = data.data.createInventoryItem;
        setInventoryItems(prev => [newItem, ...prev]);
        return { success: true, data: newItem };
      }

      return { success: false, error: 'Failed to add item' };
    } catch (error: any) {
      console.error('Error adding item:', error);
      return { success: false, error: error.message || 'Network error' };
    } finally {
      setAddingItem(false);
    }
  };

  const addItems = async (itemsData: Partial<InventoryItem>[]) => {
    try {
      setAddingItem(true);
      
      // Validate required fields
      const validItems = itemsData.filter(item => item.name && item.name.trim());
      if (validItems.length === 0) {
        return { success: false, error: 'At least one valid item is required' };
      }
      
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      // Get selected house ID
      const selectedHouseId = houseId || await AsyncStorage.getItem('selectedHouseId');
      
      if (!selectedHouseId) {
        console.error('No house selected');
        return { success: false, error: 'No house selected' };
      }

      console.log('➕ Adding multiple items to house:', selectedHouseId, 'count:', validItems.length);

      const processedItems = validItems.map(item => ({
        name: item.name!.trim(),
        category: item.category || null,
        location: item.location || getDefaultLocationForCategory(item.category),
        quantity: item.quantity || 1,
        unit: item.unit || 'pieces',
        imageUrl: item.imageUrl || null,
        barcode: item.barcode || null,
        description: item.description || null,
      }));

      const data = await NetworkManager.makeGraphQLRequest(`
        mutation CreateInventoryItems($input: CreateInventoryItemsInput!) {
          createInventoryItems(input: $input) {
            count
            items {
              id
              name
              category
              location
              quantity
              unit
              imageUrl
              barcode
              description
              createdAt
              updatedAt
            }
          }
        }
      `, {
        input: {
          houseId: selectedHouseId,
          items: processedItems,
        },
      }, token);

      console.log('➕ Add items response:', JSON.stringify(data, null, 2));

      if (data.data?.createInventoryItems) {
        const result = data.data.createInventoryItems;
        // Add to local state immediately for better UX
        setInventoryItems(prev => [...result.items, ...prev]);
        return { success: true, data: result };
      }

      return { success: false, error: 'Failed to add items' };
    } catch (error: any) {
      console.error('Error adding items:', error);
      return { success: false, error: error.message || 'Network error' };
    } finally {
      setAddingItem(false);
    }
  };

  const updateItem = async (id: string, itemData: Partial<InventoryItem>) => {
    try {
      setUpdatingItem(true);
      
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('✏️ Updating item:', id, 'with data:', itemData);

      const data = await NetworkManager.makeGraphQLRequest(`
        mutation UpdateInventoryItem($id: ID!, $input: UpdateInventoryItemInput!) {
          updateInventoryItem(id: $id, input: $input) {
            id
            name
            category
            location
            quantity
            unit
            imageUrl
            barcode
            description
            updatedAt
          }
        }
      `, {
        id,
        input: {
          name: itemData.name,
          category: itemData.category,
          location: itemData.location,
          quantity: itemData.quantity,
          unit: itemData.unit,
          imageUrl: itemData.imageUrl || null,
          barcode: itemData.barcode || null,
          description: itemData.description || null,
        },
      }, token);

      console.log('✏️ Update item response:', JSON.stringify(data, null, 2));

      if (data.data?.updateInventoryItem) {
        // Update local state immediately for better UX
        const updatedItem = data.data.updateInventoryItem;
        setInventoryItems(prev => 
          prev.map(item => item.id === id ? updatedItem : item)
        );
        return { success: true, data: updatedItem };
      }

      return { success: false, error: 'Failed to update item' };
    } catch (error: any) {
      console.error('Error updating item:', error);
      return { success: false, error: error.message || 'Network error' };
    } finally {
      setUpdatingItem(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setDeletingItem(true);
      
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        console.error('No auth token');
        return { success: false, error: 'Not authenticated' };
      }

      console.log('🗑️ Deleting item:', id);

      const data = await NetworkManager.makeGraphQLRequest(`
        mutation DeleteInventoryItem($id: ID!) {
          deleteInventoryItem(id: $id)
        }
      `, { id }, token);

      console.log('🗑️ Delete item response:', JSON.stringify(data, null, 2));

      if (data.data?.deleteInventoryItem) {
        // Remove from local state immediately for better UX
        setInventoryItems(prev => prev.filter(item => item.id !== id));
        return { success: true };
      }

      return { success: false, error: 'Failed to delete item' };
    } catch (error: any) {
      console.error('Error deleting item:', error);
      return { success: false, error: error.message || 'Network error' };
    } finally {
      setDeletingItem(false);
    }
  };

  const refresh = async () => {
    await fetchInventoryItems(true);
  };

  return {
    // Data
    inventoryItems: sortedItems,
    allItems: inventoryItems,
    loading,
    refreshing,
    
    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    
    // Actions
    getItem,
    addItem,
    addItems,
    updateItem,
    deleteItem,
    refresh,
    
    // Loading states
    addingItem,
    updatingItem,
    deletingItem,
  };
};