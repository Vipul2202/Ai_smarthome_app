'use client';

import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_SHOPPING_LISTS, 
  GET_SHOPPING_LIST 
} from '@/lib/graphql/queries';
import { 
  CREATE_SHOPPING_LIST_MUTATION, 
  UPDATE_SHOPPING_LIST_MUTATION, 
  DELETE_SHOPPING_LIST_MUTATION,
  CREATE_SHOPPING_LIST_ITEM_MUTATION,
  UPDATE_SHOPPING_LIST_ITEM_MUTATION,
  DELETE_SHOPPING_LIST_ITEM_MUTATION,
  GENERATE_AUTO_SHOPPING_LIST_MUTATION
} from '@/lib/graphql/mutations';
import { useCurrentKitchen } from './use-kitchen';

export function useShoppingLists() {
  const kitchenId = useCurrentKitchen();

  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_SHOPPING_LISTS, {
    variables: { kitchenId: kitchenId || '' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const [createList] = useMutation(CREATE_SHOPPING_LIST_MUTATION, {
    refetchQueries: [GET_SHOPPING_LISTS],
  });

  const [updateList] = useMutation(UPDATE_SHOPPING_LIST_MUTATION, {
    refetchQueries: [GET_SHOPPING_LISTS],
  });

  const [deleteList] = useMutation(DELETE_SHOPPING_LIST_MUTATION, {
    refetchQueries: [GET_SHOPPING_LISTS],
  });

  const [generateAutoListMutation] = useMutation(GENERATE_AUTO_SHOPPING_LIST_MUTATION, {
    refetchQueries: [GET_SHOPPING_LISTS],
  });

  const lists = data?.shoppingLists || [];

  // Helper functions
  const addList = async (listData: any) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    return createList({
      variables: {
        input: {
          ...listData,
          kitchenId,
        },
      },
    });
  };

  const editList = async (id: string, listData: any) => {
    return updateList({
      variables: {
        id,
        ...listData,
      },
    });
  };

  const removeList = async (id: string) => {
    return deleteList({
      variables: { id },
    });
  };

  // Auto-generate shopping list from low stock items
  const generateAutoList = async (type: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'WEEKLY') => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    try {
      const result = await generateAutoListMutation({
        variables: {
          kitchenId,
          type,
        },
      });

      if (result.data?.generateAutoShoppingList) {
        return result.data.generateAutoShoppingList;
      } else {
        throw new Error('Failed to generate auto list');
      }
    } catch (error) {
      console.error('Auto list generation failed:', error);
      throw error;
    }
  };

  return {
    // Data
    lists,
    
    // Loading states
    loading,
    error,
    
    // Actions
    createList: addList,
    addList,
    editList,
    removeList,
    generateAutoList,
    refetch,
  };
}

export function useShoppingList(listId: string) {
  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_SHOPPING_LIST, {
    variables: { id: listId },
    skip: !listId,
    errorPolicy: 'all',
  });

  const [createItem] = useMutation(CREATE_SHOPPING_LIST_ITEM_MUTATION, {
    refetchQueries: [GET_SHOPPING_LIST],
  });

  const [updateItem] = useMutation(UPDATE_SHOPPING_LIST_ITEM_MUTATION, {
    refetchQueries: [GET_SHOPPING_LIST],
  });

  const [deleteItem] = useMutation(DELETE_SHOPPING_LIST_ITEM_MUTATION, {
    refetchQueries: [GET_SHOPPING_LIST],
  });

  const list = data?.shoppingList;
  const items = list?.items || [];

  // Helper functions
  const addItem = async (itemData: any) => {
    return createItem({
      variables: {
        input: {
          ...itemData,
          shoppingListId: listId,
        },
      },
    });
  };

  const editItem = async (id: string, itemData: any) => {
    return updateItem({
      variables: {
        id,
        ...itemData,
      },
    });
  };

  const removeItem = async (id: string) => {
    return deleteItem({
      variables: { id },
    });
  };

  const toggleItem = async (id: string, isPurchased: boolean) => {
    return updateItem({
      variables: {
        id,
        isPurchased,
      },
    });
  };

  return {
    // Data
    list,
    items,
    
    // Loading states
    loading,
    error,
    
    // Actions
    addItem,
    editItem,
    removeItem,
    toggleItem,
    refetch,
  };
}