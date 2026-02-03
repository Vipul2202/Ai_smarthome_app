import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.log('No auth token, skipping inventory fetch');
        setInventoryItems([]);
        return;
      }

      // Get selected house ID
      const selectedHouseId = houseId || await AsyncStorage.getItem('selectedHouseId');
      
      if (!selectedHouseId) {
        console.error('No house selected');
        setInventoryItems([]);
        return;
      }

      console.log('📦 Fetching inventory for house:', selectedHouseId);

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
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
                createdAt
                updatedAt
              }
            }
          `,
          variables: { houseId: selectedHouseId },
        }),
      });

      const data = await response.json();
      
      // Check for errors first
      if (data.errors) {
        console.log('⚠️ GraphQL errors:', data.errors);
        setInventoryItems([]);
        return;
      }

      console.log('📦 Inventory response:', JSON.stringify(data, null, 2));

      if (data.data?.inventoryItems) {
        const items: InventoryItem[] = data.data.inventoryItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category || null,
          quantity: item.quantity || 0,
          unit: item.unit || 'pieces',
          expiryDate: null, // Not used in simplified version
          status: 'good', // Default status
          location: item.location || null,
          imageUrl: item.imageUrl,
          barcode: item.barcode,
          description: item.description,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        setInventoryItems(items);
      } else {
        setInventoryItems([]);
      }
    } catch (error) {
      console.log('⚠️ Error fetching inventory:', error);
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

  // Get low stock items
  const lowStockItems = inventoryItems.filter(item => item.quantity <= 2);

  // Categories
  const categories = ['All', ...Array.from(new Set(inventoryItems.map(item => item.category).filter(Boolean)))];

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
          category: item.category || null,
          quantity: item.quantity || 0,
          unit: item.unit || 'pieces',
          expiryDate: null,
          status: 'good',
          location: item.location || null,
          imageUrl: item.imageUrl,
          barcode: item.barcode,
          description: item.description,
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
      
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

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

      console.log('➕ Adding item to house:', selectedHouseId);

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
          `,
          variables: {
            input: {
              houseId: selectedHouseId,
              name: itemData.name.trim(),
              category: itemData.category || null,
              location: itemData.location || null,
              quantity: itemData.quantity || 1,
              unit: itemData.unit || 'pieces',
              imageUrl: itemData.imageUrl || null,
              barcode: itemData.barcode || null,
              description: itemData.description || null,
            },
          },
        }),
      });

      const data = await response.json();
      console.log('➕ Add item response:', JSON.stringify(data, null, 2));

      if (data.data?.createInventoryItem) {
        // Refresh the inventory list
        await fetchInventoryItems();
        return { success: true, data: data.data.createInventoryItem };
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return { success: false, error: data.errors[0]?.message || 'Failed to add item' };
      }

      return { success: false, error: 'Failed to add item' };
    } catch (error) {
      console.error('Error adding item:', error);
      return { success: false, error: 'Network error' };
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

      console.log('✏️ Updating item:', id);

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
                location
                quantity
                unit
                imageUrl
                barcode
                description
                updatedAt
              }
            }
          `,
          variables: {
            id,
            input: {
              name: itemData.name,
              category: itemData.category,
              location: itemData.location,
              quantity: itemData.quantity,
              unit: itemData.unit,
              imageUrl: itemData.imageUrl,
              barcode: itemData.barcode,
              description: itemData.description,
            },
          },
        }),
      });

      const data = await response.json();
      console.log('✏️ Update item response:', JSON.stringify(data, null, 2));

      if (data.data?.updateInventoryItem) {
        // Refresh the inventory list
        await fetchInventoryItems();
        return { success: true, data: data.data.updateInventoryItem };
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return { success: false, error: data.errors[0]?.message || 'Failed to update item' };
      }

      return { success: false, error: 'Failed to update item' };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: 'Network error' };
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

      console.log('🗑️ Deleting item:', id);

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
        // Refresh the inventory list
        await fetchInventoryItems();
        return { success: true };
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        return { success: false, error: data.errors[0]?.message || 'Failed to delete item' };
      }

      return { success: false, error: 'Failed to delete item' };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setDeletingItem(false);
    }
  };

  const processVoiceCommand = async (transcript: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';
      const selectedHouseId = houseId || await AsyncStorage.getItem('selectedHouseId');

      if (!token || !selectedHouseId) {
        return { success: false, error: 'Not authenticated or no house selected' };
      }

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation ProcessVoiceIntent($transcript: String!, $houseId: ID!) {
              processVoiceIntent(transcript: $transcript, houseId: $houseId) {
                intent
                item {
                  name
                  quantity
                  unit
                  category
                  location
                }
                confidence
                missingInfo
              }
            }
          `,
          variables: { transcript, houseId: selectedHouseId },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        console.error('Voice processing errors:', data.errors);
        return { success: false, error: data.errors[0]?.message || 'Failed to process voice command' };
      }

      return { success: true, data: data.data?.processVoiceIntent };
    } catch (error) {
      console.error('Error processing voice command:', error);
      return { success: false, error: 'Network error' };
    }
  };

  return {
    // Data
    inventoryItems: filteredItems,
    allItems: inventoryItems,
    itemsByStatus,
    lowStockItems,
    categories,
    
    // State
    loading,
    addingItem,
    updatingItem,
    deletingItem,
    refreshing,
    
    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    
    // Actions
    fetchInventoryItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    processVoiceCommand,
    
    // Refresh
    refresh: () => fetchInventoryItems(true),
  };
};