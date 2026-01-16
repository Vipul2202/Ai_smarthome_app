import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_HOUSEHOLD,
  CREATE_HOUSEHOLD,
  UPDATE_HOUSEHOLD,
  ADD_HOUSEHOLD_MEMBER,
  REMOVE_HOUSEHOLD_MEMBER,
  CREATE_KITCHEN,
  UPDATE_KITCHEN,
  DELETE_KITCHEN
} from '@/lib/graphql/household';
import { Household, Kitchen, User } from '@/types';

interface UseHouseholdProps {
  userId?: string;
}

export const useHousehold = ({ userId }: UseHouseholdProps = {}) => {
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_HOUSEHOLD, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
  });

  const [createHouseholdMutation, { loading: creatingHousehold }] = useMutation(CREATE_HOUSEHOLD, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const [updateHouseholdMutation, { loading: updatingHousehold }] = useMutation(UPDATE_HOUSEHOLD, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const [addMemberMutation, { loading: addingMember }] = useMutation(ADD_HOUSEHOLD_MEMBER, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const [removeMemberMutation, { loading: removingMember }] = useMutation(REMOVE_HOUSEHOLD_MEMBER, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const [createKitchenMutation, { loading: creatingKitchen }] = useMutation(CREATE_KITCHEN, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const [updateKitchenMutation, { loading: updatingKitchen }] = useMutation(UPDATE_KITCHEN, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const [deleteKitchenMutation, { loading: deletingKitchen }] = useMutation(DELETE_KITCHEN, {
    refetchQueries: [{ query: GET_HOUSEHOLD, variables: { userId } }],
  });

  const household: Household | null = data?.household || null;
  const kitchens: Kitchen[] = household?.kitchens || [];
  const members: User[] = household?.members || [];

  // Get selected kitchen
  const selectedKitchen = selectedKitchenId 
    ? kitchens.find(kitchen => kitchen.id === selectedKitchenId)
    : kitchens[0] || null;

  // Get household statistics
  const householdStats = {
    totalMembers: members.length,
    totalKitchens: kitchens.length,
    totalInventoryItems: kitchens.reduce((sum, kitchen) => sum + (kitchen.inventoryItems?.length || 0), 0),
    activeMembers: members.filter(member => {
      // Consider a member active if they've been active in the last 30 days
      // This would need to be implemented based on your user activity tracking
      return true; // Placeholder
    }).length,
  };

  const createHousehold = async (householdData: { name: string; description?: string }) => {
    try {
      const { data: result } = await createHouseholdMutation({
        variables: {
          input: {
            ...householdData,
            ownerId: userId,
          },
        },
      });
      return { success: true, data: result.createHousehold };
    } catch (error) {
      console.error('Error creating household:', error);
      return { success: false, error };
    }
  };

  const updateHousehold = async (householdData: Partial<Household>) => {
    if (!household) return { success: false, error: 'No household found' };

    try {
      await updateHouseholdMutation({
        variables: {
          id: household.id,
          input: householdData,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating household:', error);
      return { success: false, error };
    }
  };

  const addMember = async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!household) return { success: false, error: 'No household found' };

    try {
      await addMemberMutation({
        variables: {
          householdId: household.id,
          email,
          role,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding member:', error);
      return { success: false, error };
    }
  };

  const removeMember = async (memberId: string) => {
    if (!household) return { success: false, error: 'No household found' };

    try {
      await removeMemberMutation({
        variables: {
          householdId: household.id,
          memberId,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error removing member:', error);
      return { success: false, error };
    }
  };

  const createKitchen = async (kitchenData: { name: string; description?: string }) => {
    if (!household) return { success: false, error: 'No household found' };

    try {
      const { data: result } = await createKitchenMutation({
        variables: {
          input: {
            ...kitchenData,
            householdId: household.id,
          },
        },
      });
      
      // Auto-select the new kitchen
      if (result?.createKitchen?.id) {
        setSelectedKitchenId(result.createKitchen.id);
      }
      
      return { success: true, data: result.createKitchen };
    } catch (error) {
      console.error('Error creating kitchen:', error);
      return { success: false, error };
    }
  };

  const updateKitchen = async (kitchenId: string, kitchenData: Partial<Kitchen>) => {
    try {
      await updateKitchenMutation({
        variables: {
          id: kitchenId,
          input: kitchenData,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating kitchen:', error);
      return { success: false, error };
    }
  };

  const deleteKitchen = async (kitchenId: string) => {
    try {
      await deleteKitchenMutation({
        variables: { id: kitchenId },
      });
      
      // If deleted kitchen was selected, select another one
      if (selectedKitchenId === kitchenId) {
        const remainingKitchens = kitchens.filter(k => k.id !== kitchenId);
        setSelectedKitchenId(remainingKitchens.length > 0 ? remainingKitchens[0].id : null);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting kitchen:', error);
      return { success: false, error };
    }
  };

  const switchKitchen = (kitchenId: string) => {
    setSelectedKitchenId(kitchenId);
  };

  const getMemberRole = (memberId: string): 'owner' | 'admin' | 'member' => {
    if (!household) return 'member';
    
    // This would need to be implemented based on your household member role system
    // For now, return 'member' as default
    return 'member';
  };

  const canManageHousehold = (memberId: string): boolean => {
    const role = getMemberRole(memberId);
    return role === 'owner' || role === 'admin';
  };

  const canManageKitchen = (memberId: string, kitchenId: string): boolean => {
    // For now, all members can manage kitchens
    // You can implement more granular permissions here
    return true;
  };

  return {
    // Data
    household,
    kitchens,
    members,
    selectedKitchen,
    selectedKitchenId,
    householdStats,
    
    // State
    loading,
    error,
    
    // Loading states
    creatingHousehold,
    updatingHousehold,
    addingMember,
    removingMember,
    creatingKitchen,
    updatingKitchen,
    deletingKitchen,
    
    // Actions
    createHousehold,
    updateHousehold,
    addMember,
    removeMember,
    createKitchen,
    updateKitchen,
    deleteKitchen,
    switchKitchen,
    getMemberRole,
    canManageHousehold,
    canManageKitchen,
    refetch,
    
    // Setters
    setSelectedKitchenId,
  };
};