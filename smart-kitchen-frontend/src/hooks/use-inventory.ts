'use client';

import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_INVENTORY_ITEMS, 
  GET_LOW_STOCK_ITEMS, 
  GET_EXPIRING_ITEMS 
} from '@/lib/graphql/queries';
import { 
  CREATE_INVENTORY_ITEM_MUTATION, 
  UPDATE_INVENTORY_ITEM_MUTATION, 
  DELETE_INVENTORY_ITEM_MUTATION,
  CREATE_INVENTORY_BATCH_MUTATION,
  UPDATE_INVENTORY_BATCH_MUTATION,
  DELETE_INVENTORY_BATCH_MUTATION,
  BULK_CREATE_INVENTORY_ITEMS_MUTATION
} from '@/lib/graphql/mutations';
import { useCurrentKitchen } from './use-kitchen';

export function useInventory() {
  const kitchenId = useCurrentKitchen();

  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_INVENTORY_ITEMS, {
    variables: { kitchenId: kitchenId || '' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { 
    data: lowStockData, 
    loading: lowStockLoading 
  } = useQuery(GET_LOW_STOCK_ITEMS, {
    variables: { kitchenId: kitchenId || '' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { 
    data: expiringData, 
    loading: expiringLoading 
  } = useQuery(GET_EXPIRING_ITEMS, {
    variables: { kitchenId: kitchenId || '', days: 7 },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const [createItem] = useMutation(CREATE_INVENTORY_ITEM_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS, GET_LOW_STOCK_ITEMS, GET_EXPIRING_ITEMS],
  });

  const [updateItem] = useMutation(UPDATE_INVENTORY_ITEM_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS, GET_LOW_STOCK_ITEMS, GET_EXPIRING_ITEMS],
  });

  const [deleteItem] = useMutation(DELETE_INVENTORY_ITEM_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS, GET_LOW_STOCK_ITEMS, GET_EXPIRING_ITEMS],
  });

  const [createBatch] = useMutation(CREATE_INVENTORY_BATCH_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS],
  });

  const [updateBatch] = useMutation(UPDATE_INVENTORY_BATCH_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS],
  });

  const [deleteBatch] = useMutation(DELETE_INVENTORY_BATCH_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS],
  });

  const [bulkCreateItems] = useMutation(BULK_CREATE_INVENTORY_ITEMS_MUTATION, {
    refetchQueries: [GET_INVENTORY_ITEMS, GET_LOW_STOCK_ITEMS, GET_EXPIRING_ITEMS],
  });

  const items = data?.inventoryItems || [];
  const lowStockItems = lowStockData?.lowStockItems || [];
  const expiringItems = expiringData?.expiringItems || [];

  // Helper function to get emoji based on category
  const getCategoryEmoji = (category: string) => {
    const categoryEmojis: { [key: string]: string } = {
      'Dairy': '🥛',
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Grains': '🌾',
      'Spices': '🌶️',
      'Meat': '🥩',
      'Seafood': '🐟',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Condiments': '🍯',
      'Frozen': '🧊',
      'Bakery': '🍞',
      'Pantry': '🥫'
    };
    return categoryEmojis[category] || '📦';
  }; 

  // Transform GraphQL data to match component expectations
  const transformedItems = items.map((item: any) => ({
    id: item.id,
    name: item.name,
    quantity: item.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0,
    unit: item.defaultUnit || 'pieces',
    status: item.batches?.some((batch: any) => new Date(batch.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ? 'EXPIRING' : 'OK',
    expiry: item.batches?.[0]?.expiryDate || null,
    location: item.location || 'Pantry',
    img: getCategoryEmoji(item.category),
    qty: item.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0,
    category: item.category,
    brand: item.brand,
    threshold: item.threshold
  })); 
  
  // Use real data from GraphQL queries
  const finalItems = transformedItems;

  // Helper functions
  const addItem = async (itemData: any) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    const finalData = {
      ...itemData,
      kitchenId,
    };
    
    console.log('GraphQL mutation input:', finalData);
    
    return createItem({
      variables: {
        input: finalData,
      },
    });
  };

  const editItem = async (id: string, itemData: any) => {
    return updateItem({
      variables: {
        id,
        input: itemData,
      },
    });
  };

  const removeItem = async (id: string) => {
    return deleteItem({
      variables: { id },
    });
  };

  const addBatch = async (itemId: string, batchData: any) => {
    // Convert date strings to proper DateTime format
    const processedData = { itemId, ...batchData };
    
    // Handle expiryDate
    if (processedData.expiryDate && typeof processedData.expiryDate === 'string') {
      if (processedData.expiryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData.expiryDate = new Date(processedData.expiryDate + 'T12:00:00.000Z').toISOString();
      }
    }
    
    // Handle purchaseDate
    if (processedData.purchaseDate && typeof processedData.purchaseDate === 'string') {
      if (processedData.purchaseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData.purchaseDate = new Date(processedData.purchaseDate + 'T12:00:00.000Z').toISOString();
      }
    }
    
    return createBatch({
      variables: {
        input: processedData,
      },
    });
  };

  const editBatch = async (id: string, batchData: any) => {
    // Convert date strings to proper DateTime format
    const processedData = { ...batchData };
    
    // Handle expiryDate
    if (processedData.expiryDate && typeof processedData.expiryDate === 'string') {
      if (processedData.expiryDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData.expiryDate = new Date(processedData.expiryDate + 'T12:00:00.000Z').toISOString();
      }
    }
    
    // Handle purchaseDate
    if (processedData.purchaseDate && typeof processedData.purchaseDate === 'string') {
      if (processedData.purchaseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData.purchaseDate = new Date(processedData.purchaseDate + 'T12:00:00.000Z').toISOString();
      }
    }
    
    return updateBatch({
      variables: {
        id,
        ...processedData,
      },
    });
  };

  const removeBatch = async (id: string) => {
    return deleteBatch({
      variables: { id },
    });
  };

  const bulkAdd = async (itemsData: any[]) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    const itemsWithKitchen = itemsData.map(item => ({
      ...item,
      kitchenId,
    }));

    return bulkCreateItems({
      variables: {
        items: itemsWithKitchen,
      },
    });
  };

  return {
    // Data - use mock data if no real data available
    items: finalItems,
    lowStockItems,
    expiringItems,
    
    // Loading states
    loading: loading || lowStockLoading || expiringLoading,
    error,
    
    // Actions
    addItem,
    editItem,
    removeItem,
    addBatch,
    editBatch,
    removeBatch,
    bulkAdd,
    refetch,
    
    // Stats
    stats: {
      total: finalItems.length,
      lowStock: lowStockItems.length,
      expiring: expiringItems.length,
      ok: finalItems.filter((item: any) => item.status === 'OK').length,
    },
  };
}