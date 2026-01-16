import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_USER_SETTINGS, 
  GET_USER_PREFERENCES, 
  UPDATE_USER_PROFILE,
  UPDATE_USER_SETTINGS,
  UPDATE_USER_PREFERENCES,
  ME_QUERY
} from '@/lib/graphql/queries';

export interface NotificationSettings {
  lowStock: boolean;
  expiry: boolean;
  shopping: boolean;
  mealPlan: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'HOUSEHOLD_ONLY' | 'PRIVATE';
  dataSharing: boolean;
  analyticsOptOut: boolean;
}

export interface UserPreferences {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

export interface UserProfile {
  name?: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

export function useSettings() {
  // Queries
  const { 
    data: settingsData, 
    loading: settingsLoading, 
    error: settingsError,
    refetch: refetchSettings
  } = useQuery(GET_USER_SETTINGS);

  const { 
    data: preferencesData, 
    loading: preferencesLoading, 
    error: preferencesError,
    refetch: refetchPreferences
  } = useQuery(GET_USER_PREFERENCES);

  // Mutations
  const [updateProfileMutation, { loading: profileLoading }] = useMutation(UPDATE_USER_PROFILE, {
    refetchQueries: [{ query: ME_QUERY }],
  });

  const [updateSettingsMutation, { loading: settingsUpdating }] = useMutation(UPDATE_USER_SETTINGS, {
    refetchQueries: [{ query: GET_USER_SETTINGS }],
  });

  const [updatePreferencesMutation, { loading: preferencesUpdating }] = useMutation(UPDATE_USER_PREFERENCES, {
    refetchQueries: [{ query: GET_USER_PREFERENCES }],
  });

  // Helper functions
  const updateProfile = async (input: UserProfile) => {
    try {
      const { data } = await updateProfileMutation({
        variables: { input },
      });
      return data.updateUserProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateNotifications = async (notifications: Partial<NotificationSettings>) => {
    try {
      await updateSettingsMutation({
        variables: {
          input: { notifications },
        },
      });
      return true;
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  };

  const updatePrivacy = async (privacy: Partial<PrivacySettings>) => {
    try {
      await updateSettingsMutation({
        variables: {
          input: { privacy },
        },
      });
      return true;
    } catch (error) {
      console.error('Error updating privacy:', error);
      throw error;
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      await updatePreferencesMutation({
        variables: { input: preferences },
      });
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  return {
    // Data
    settings: settingsData?.userSettings,
    preferences: preferencesData?.userPreferences,
    
    // Loading states
    loading: settingsLoading || preferencesLoading,
    profileLoading,
    settingsUpdating,
    preferencesUpdating,
    
    // Errors
    error: settingsError || preferencesError,
    
    // Actions
    updateProfile,
    updateNotifications,
    updatePrivacy,
    updatePreferences,
    
    // Refetch
    refetchSettings,
    refetchPreferences,
  };
}

export function useUserProfile() {
  const { data, loading, error } = useQuery(ME_QUERY);
  
  return {
    user: data?.me,
    loading,
    error,
  };
}