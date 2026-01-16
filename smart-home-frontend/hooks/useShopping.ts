import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_SHOPPING_LISTS, 
  CREATE_SHOPPING_LIST, 
  UPDATE_SHOPPING_LIST, 
  DELETE_SHOPPING_LIST,
  ADD_SHOPPING_ITEM,
  UPDATE_SHOPPING_ITEM,
  DELETE_SHOPPING_ITEM,
  GET_SHOPPING_SUGGESTIONS
} from '@/lib/graphql/shopping';
import { ShoppingList, ShoppingListItem } from '@/types';

interface UseShoppingProps {
  householdId?: string;
}

export const useShopping = ({ householdId }: UseShoppingProps = {}) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_SHOPPING_LISTS, {
    variables: { householdId },
    skip: !householdId,
    errorPolicy: 'all',
  });

  const { data: suggestionsData, loading: loadingSuggestions } = useQuery(GET_SHOPPING_SUGGESTIONS, {
    variables: { householdId },
    skip: !householdId,
    errorPolicy: 'all',
  });

  const [createListMutation, { loading: creatingList }] = useMutation(CREATE_SHOPPING_LIST, {
    refetchQueries: [{ query: GET_SHOPPING_LISTS, variables: { householdId } }],
  });

  const [updateListMutation, { loading: updatingList }] = useMutation(UPDATE_SHOPPING_LIST, {
    refetchQueries: [{ query: GET_SHOPPING_LISTS, variables: { householdId } }],
  });

  const [deleteListMutation, { loading: deletingList }] = useMutation(DELETE_SHOPPING_LIST, {
    refetchQueries: [{ query: GET_SHOPPING_LISTS, variables: { householdId } }],
  });

  const [addItemMutation, { loading: addingItem }] = useMutation(ADD_SHOPPING_ITEM, {
    refetchQueries: [{ query: GET_SHOPPING_LISTS, variables: { householdId } }],
  });

  const [updateItemMutation, { loading: updatingItem }] = useMutation(UPDATE_SHOPPING_ITEM, {
    refetchQueries: [{ query: GET_SHOPPING_LISTS, variables: { householdId } }],
  });

  const [deleteItemMutation, { loading: deletingItem }] = useMutation(DELETE_SHOPPING_ITEM, {
    refetchQueries: [{ query: GET_SHOPPING_LISTS, variables: { householdId } }],
  });

  const shoppingLists: ShoppingList[] = data?.shoppingLists || [];
  const suggestions = suggestionsData?.shoppingSuggestions || [];

  // Get selected list
  const selectedList = selectedListId 
    ? shoppingLists.find(list => list.id === selectedListId)
    : null;

  // Get list statistics
  const listStats = shoppingLists.map(list => ({
    ...list,
    completedItems: list.items.filter(item => item.completed).length,
    totalItems: list.items.length,
    completionPercentage: list.items.length > 0 
      ? Math.round((list.items.filter(item => item.completed).length / list.items.length) * 100)
      : 0,
    totalCost: list.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
  }));

  // Get urgent lists
  const urgentLists = shoppingLists.filter(list => list.urgent);

  // Get completed lists
  const completedLists = shoppingLists.filter(list => 
    list.items.length > 0 && list.items.every(item => item.completed)
  );

  const createList = async (listData: Partial<ShoppingList>) => {
    try {
      const { data: result } = await createListMutation({
        variables: {
          input: {
            ...listData,
            householdId,
          },
        },
      });
      return { success: true, data: result.createShoppingList };
    } catch (error) {
      console.error('Error creating shopping list:', error);
      return { success: false, error };
    }
  };

  const updateList = async (id: string, listData: Partial<ShoppingList>) => {
    try {
      await updateListMutation({
        variables: {
          id,
          input: listData,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating shopping list:', error);
      return { success: false, error };
    }
  };

  const deleteList = async (id: string) => {
    try {
      await deleteListMutation({
        variables: { id },
      });
      if (selectedListId === id) {
        setSelectedListId(null);
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      return { success: false, error };
    }
  };

  const addItem = async (listId: string, itemData: Partial<ShoppingListItem>) => {
    try {
      await addItemMutation({
        variables: {
          listId,
          input: itemData,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding shopping item:', error);
      return { success: false, error };
    }
  };

  const updateItem = async (itemId: string, itemData: Partial<ShoppingListItem>) => {
    try {
      await updateItemMutation({
        variables: {
          id: itemId,
          input: itemData,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating shopping item:', error);
      return { success: false, error };
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await deleteItemMutation({
        variables: { id: itemId },
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      return { success: false, error };
    }
  };

  const toggleItemCompleted = async (itemId: string, completed: boolean) => {
    return updateItem(itemId, { completed });
  };

  const addSuggestionToList = async (listId: string, suggestion: any) => {
    return addItem(listId, {
      name: suggestion.name,
      quantity: 1,
      unit: suggestion.unit || 'piece',
      category: suggestion.category,
      completed: false,
    });
  };

  const addAllSuggestionsToList = async (listId: string) => {
    try {
      const promises = suggestions.map(suggestion => 
        addSuggestionToList(listId, suggestion)
      );
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error adding all suggestions:', error);
      return { success: false, error };
    }
  };

  const duplicateList = async (listId: string, newName?: string) => {
    const originalList = shoppingLists.find(list => list.id === listId);
    if (!originalList) return { success: false, error: 'List not found' };

    return createList({
      name: newName || `${originalList.name} (Copy)`,
      color: originalList.color,
      urgent: false,
      items: originalList.items.map(item => ({
        ...item,
        completed: false,
      })),
    });
  };

  const clearCompletedItems = async (listId: string) => {
    const list = shoppingLists.find(l => l.id === listId);
    if (!list) return { success: false, error: 'List not found' };

    try {
      const completedItems = list.items.filter(item => item.completed);
      const promises = completedItems.map(item => deleteItem(item.id));
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error clearing completed items:', error);
      return { success: false, error };
    }
  };

  return {
    // Data
    lists: shoppingLists,
    listStats,
    urgentLists,
    completedLists,
    selectedList,
    suggestions,
    
    // State
    selectedListId,
    loading,
    error,
    loadingSuggestions,
    
    // Loading states
    creatingList,
    updatingList,
    deletingList,
    addingItem,
    updatingItem,
    deletingItem,
    
    // Actions
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    deleteItem,
    toggleItemCompleted,
    addSuggestionToList,
    addAllSuggestionsToList,
    duplicateList,
    clearCompletedItems,
    refetch,
    
    // Setters
    setSelectedListId,
  };
};