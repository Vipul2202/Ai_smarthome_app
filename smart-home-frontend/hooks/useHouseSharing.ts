import { useMutation, useQuery } from '@apollo/client';
import {
  CREATE_HOUSE_INVITATION,
  ACCEPT_HOUSE_INVITATION,
  REVOKE_HOUSE_INVITATION,
  REMOVE_HOUSE_SHARE,
  UPDATE_HOUSE_SHARE_ROLE,
  GET_SHARED_HOUSES,
  GET_HOUSE_INVITATIONS,
  GET_HOUSE_SHARES,
} from '../lib/graphql/houseSharing';
import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getErrorMessage, getErrorTitle } from '../lib/errorHandler';

export const useHouseSharing = () => {
  const [createInvitation] = useMutation(CREATE_HOUSE_INVITATION, {
    errorPolicy: 'all',
  });
  const [acceptInvitation] = useMutation(ACCEPT_HOUSE_INVITATION, {
    errorPolicy: 'all',
  });
  const [revokeInvitation] = useMutation(REVOKE_HOUSE_INVITATION, {
    errorPolicy: 'all',
  });
  const [removeShare] = useMutation(REMOVE_HOUSE_SHARE, {
    errorPolicy: 'all',
  });
  const [updateShareRole] = useMutation(UPDATE_HOUSE_SHARE_ROLE, {
    errorPolicy: 'all',
  });

  const createHouseInvitation = async (
    houseId: string,
    invitedUserId: string,
    role: 'READ' | 'WRITE',
    expiryDays: number = 7
  ) => {
    try {
      console.log('Calling createInvitation mutation with:', {
        houseId,
        invitedUserId,
        role,
        expiryDays,
      });

      const { data, errors } = await createInvitation({
        variables: {
          input: {
            houseId,
            invitedUserId,
            role,
            expiryDays,
          },
        },
      });

      console.log('Mutation response:', { data, errors });

      if (errors && errors.length > 0) {
        console.error('GraphQL errors:', errors);
        const errorMessage = errors[0].message;
        
        // Check for specific errors that should be handled by the calling component
        if (errorMessage.includes('cannot invite yourself') || 
            errorMessage.includes('your own house') ||
            errorMessage.includes('already has access') ||
            errorMessage.includes('pending invitation')) {
          // Don't show alert here, let the calling component handle it
          throw new Error(errorMessage);
        }
        
        // For other errors, show alert
        Alert.alert('Error', errorMessage);
        throw new Error(errorMessage);
      }

      if (!data || !data.createHouseInvitation) {
        throw new Error('No data returned from server');
      }

      const inviteLink = data.createHouseInvitation.inviteLink;
      
      // Copy to clipboard
      await Clipboard.setStringAsync(inviteLink);
      
      // Show share dialog
      try {
        await Share.share({
          message: `Join my house on Smart Home! ${role === 'READ' ? 'View' : 'Edit'} access granted.\n\n${inviteLink}`,
          title: 'Share House Access',
        });
      } catch (shareError) {
        console.log('Share cancelled or failed:', shareError);
      }

      Alert.alert(
        'Invitation Created',
        `Invite link copied to clipboard!\n\nAccess: ${role}\nExpires in: ${expiryDays} days`,
        [{ text: 'OK' }]
      );

      return data.createHouseInvitation;
    } catch (error: any) {
      console.error('createHouseInvitation error:', error);
      
      // Check if this is a user-friendly error that should be handled by the calling component
      const errorMessage = error?.message || '';
      if (errorMessage.includes('cannot invite yourself') || 
          errorMessage.includes('your own house') ||
          errorMessage.includes('already has access') ||
          errorMessage.includes('pending invitation')) {
        // Just throw, don't show alert
        throw error;
      }
      
      // For other errors, show alert
      Alert.alert(getErrorTitle(error), getErrorMessage(error));
      throw error;
    }
  };

  const acceptHouseInvitation = async (inviteCode: string) => {
    try {
      const result = await acceptInvitation({
        variables: {
          input: { inviteCode },
        },
        refetchQueries: ['GetSharedHouses', 'GetHouses'],
      });

      const { data, errors } = result;

      // Check for GraphQL errors
      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      // Check if data exists
      if (!data) {
        throw new Error('No response from server. Please try again.');
      }

      // Check if acceptHouseInvitation exists in data
      if (!data.acceptHouseInvitation) {
        throw new Error('Failed to accept invitation. The invitation may be invalid or expired.');
      }

      Alert.alert(
        'Success! 🎉',
        `You now have access to "${data.acceptHouseInvitation.name}"!`,
        [{ text: 'OK' }]
      );

      return data.acceptHouseInvitation;
    } catch (error: any) {
      // Don't log to console - handle silently
      
      // Don't show alert for "own house" error - let the calling component handle it
      const errorMessage = error?.message || '';
      if (!errorMessage.toLowerCase().includes('your own house') && 
          !errorMessage.toLowerCase().includes('cannot join your own')) {
        Alert.alert(getErrorTitle(error), getErrorMessage(error));
      }
      
      throw error;
    }
  };

  const revokeHouseInvitation = async (invitationId: string) => {
    try {
      await revokeInvitation({
        variables: { invitationId },
        refetchQueries: ['GetHouseInvitations'],
      });

      Alert.alert('Success', 'Invitation revoked successfully');
      return true;
    } catch (error: any) {
      Alert.alert(getErrorTitle(error), getErrorMessage(error));
      throw error;
    }
  };

  const removeHouseShare = async (shareId: string, userName: string) => {
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Remove Access',
        `Remove ${userName}'s access to this house?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeShare({
                  variables: { shareId },
                  refetchQueries: ['GetHouseShares'],
                });
                Alert.alert('Success', 'Access removed successfully');
                resolve(true);
              } catch (error: any) {
                Alert.alert(getErrorTitle(error), getErrorMessage(error));
                resolve(false);
              }
            },
          },
        ]
      );
    });
  };

  const updateHouseShareRole = async (
    shareId: string,
    role: 'READ' | 'WRITE',
    userName: string
  ) => {
    try {
      await updateShareRole({
        variables: { shareId, role },
        refetchQueries: ['GetHouseShares'],
      });

      Alert.alert(
        'Success',
        `${userName}'s access updated to ${role === 'READ' ? 'View Only' : 'Edit'}`
      );
      return true;
    } catch (error: any) {
      Alert.alert(getErrorTitle(error), getErrorMessage(error));
      throw error;
    }
  };

  return {
    createHouseInvitation,
    acceptHouseInvitation,
    revokeHouseInvitation,
    removeHouseShare,
    updateHouseShareRole,
  };
};

export const useSharedHouses = () => {
  const { data, loading, error, refetch } = useQuery(GET_SHARED_HOUSES);

  return {
    sharedHouses: data?.sharedHouses || [],
    loading,
    error,
    refetch,
  };
};

export const useHouseInvitations = (houseId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_HOUSE_INVITATIONS, {
    variables: { houseId },
    skip: !houseId,
  });

  return {
    invitations: data?.houseInvitations || [],
    loading,
    error,
    refetch,
  };
};

export const useHouseShares = (houseId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_HOUSE_SHARES, {
    variables: { houseId },
    skip: !houseId,
  });

  return {
    shares: data?.houseShares || [],
    loading,
    error,
    refetch,
  };
};
