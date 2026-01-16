import { useMutation, useQuery } from '@apollo/client';
import { GET_HOUSEHOLDS } from '@/lib/graphql/queries';
import { 
  CREATE_HOUSEHOLD_MUTATION,
  UPDATE_HOUSEHOLD_MUTATION,
  DELETE_HOUSEHOLD_MUTATION,
  INVITE_MEMBER_MUTATION,
  CREATE_KITCHEN_MUTATION,
  UPDATE_KITCHEN_MUTATION,
  DELETE_KITCHEN_MUTATION
} from '@/lib/graphql/mutations';

export interface Kitchen {
  id: string;
  name: string;
  type: 'HOME' | 'OFFICE' | 'PG' | 'HOSTEL';
  description?: string;
}

export interface HouseholdMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface Household {
  id: string;
  name: string;
  description?: string;
  inviteCode?: string;
  kitchens: Kitchen[];
  members: HouseholdMember[];
  createdAt: string;
  updatedAt: string;
}

export function useHouseholds() {
  // Queries
  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_HOUSEHOLDS);

  // Mutations
  const [createHouseholdMutation, { loading: creating }] = useMutation(CREATE_HOUSEHOLD_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEHOLDS }],
  });

  const [updateHouseholdMutation, { loading: updating }] = useMutation(UPDATE_HOUSEHOLD_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEHOLDS }],
  });

  const [deleteHouseholdMutation, { loading: deleting }] = useMutation(DELETE_HOUSEHOLD_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEHOLDS }],
  });

  const [inviteMemberMutation, { loading: inviting }] = useMutation(INVITE_MEMBER_MUTATION);

  const [createKitchenMutation, { loading: creatingKitchen }] = useMutation(CREATE_KITCHEN_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEHOLDS }],
  });

  const [updateKitchenMutation, { loading: updatingKitchen }] = useMutation(UPDATE_KITCHEN_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEHOLDS }],
  });

  const [deleteKitchenMutation, { loading: deletingKitchen }] = useMutation(DELETE_KITCHEN_MUTATION, {
    refetchQueries: [{ query: GET_HOUSEHOLDS }],
  });

  // Helper functions
  const createHousehold = async (input: { name: string; description?: string }) => {
    try {
      const { data } = await createHouseholdMutation({
        variables: { input },
      });
      return data.createHousehold;
    } catch (error) {
      console.error('Error creating household:', error);
      throw error;
    }
  };

  const updateHousehold = async (id: string, input: { name?: string; description?: string }) => {
    try {
      const { data } = await updateHouseholdMutation({
        variables: { id, input },
      });
      return data.updateHousehold;
    } catch (error) {
      console.error('Error updating household:', error);
      throw error;
    }
  };

  const deleteHousehold = async (id: string) => {
    try {
      await deleteHouseholdMutation({
        variables: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting household:', error);
      throw error;
    }
  };

  const inviteMember = async (householdId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') => {
    try {
      await inviteMemberMutation({
        variables: { householdId, email, role },
      });
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      throw error;
    }
  };

  const createKitchen = async (input: { householdId: string; name: string; type: Kitchen['type']; description?: string }) => {
    try {
      const { data } = await createKitchenMutation({
        variables: { input },
      });
      return data.createKitchen;
    } catch (error) {
      console.error('Error creating kitchen:', error);
      throw error;
    }
  };

  const updateKitchen = async (id: string, input: { name?: string; type?: Kitchen['type']; description?: string }) => {
    try {
      const { data } = await updateKitchenMutation({
        variables: { id, input },
      });
      return data.updateKitchen;
    } catch (error) {
      console.error('Error updating kitchen:', error);
      throw error;
    }
  };

  const deleteKitchen = async (id: string) => {
    try {
      await deleteKitchenMutation({
        variables: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting kitchen:', error);
      throw error;
    }
  };

  return {
    // Data
    households: data?.households || [],
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    inviting,
    creatingKitchen,
    updatingKitchen,
    deletingKitchen,
    
    // Error
    error,
    
    // Actions
    createHousehold,
    updateHousehold,
    deleteHousehold,
    inviteMember,
    createKitchen,
    updateKitchen,
    deleteKitchen,
    
    // Refetch
    refetch,
  };
}