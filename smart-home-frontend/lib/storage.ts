import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  NOTIFICATION_SETTINGS: 'notificationSettings',
  SELECTED_KITCHEN: 'selectedKitchen',
  SELECTED_HOUSEHOLD: 'selectedHousehold',
  PUSH_TOKEN: 'expoPushToken',
  OFFLINE_DATA: 'offlineData',
} as const;

// Secure storage for sensitive data
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw error;
    }
  },
};

// Regular storage for non-sensitive data
export const storage = {
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing item:', error);
      throw error;
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving item:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return [];
    }
  },

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw error;
    }
  },
};

// Auth-specific storage helpers
export const authStorage = {
  async setToken(token: string): Promise<void> {
    await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async removeToken(): Promise<void> {
    await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setUserData(userData: any): Promise<void> {
    await storage.setItem(STORAGE_KEYS.USER_DATA, userData);
  },

  async getUserData(): Promise<any> {
    return await storage.getItem(STORAGE_KEYS.USER_DATA);
  },

  async removeUserData(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  async clearAuthData(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      storage.removeItem(STORAGE_KEYS.USER_DATA),
    ]);
  },
};

// Settings storage helpers
export const settingsStorage = {
  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await storage.setItem(STORAGE_KEYS.THEME, theme);
  },

  async getTheme(): Promise<'light' | 'dark' | 'system' | null> {
    return await storage.getItem(STORAGE_KEYS.THEME);
  },

  async setNotificationSettings(settings: any): Promise<void> {
    await storage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
  },

  async getNotificationSettings(): Promise<any> {
    return await storage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  },

  async getOnboardingCompleted(): Promise<boolean> {
    const completed = await storage.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed ?? false;
  },
};

// App state storage helpers
export const appStateStorage = {
  async setSelectedKitchen(kitchenId: string): Promise<void> {
    await storage.setItem(STORAGE_KEYS.SELECTED_KITCHEN, kitchenId);
  },

  async getSelectedKitchen(): Promise<string | null> {
    return await storage.getItem(STORAGE_KEYS.SELECTED_KITCHEN);
  },

  async setSelectedHousehold(householdId: string): Promise<void> {
    await storage.setItem(STORAGE_KEYS.SELECTED_HOUSEHOLD, householdId);
  },

  async getSelectedHousehold(): Promise<string | null> {
    return await storage.getItem(STORAGE_KEYS.SELECTED_HOUSEHOLD);
  },

  async setPushToken(token: string): Promise<void> {
    await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
  },

  async getPushToken(): Promise<string | null> {
    return await storage.getItem(STORAGE_KEYS.PUSH_TOKEN);
  },
};

// Offline data storage helpers
export const offlineStorage = {
  async setOfflineData(data: any): Promise<void> {
    await storage.setItem(STORAGE_KEYS.OFFLINE_DATA, data);
  },

  async getOfflineData(): Promise<any> {
    return await storage.getItem(STORAGE_KEYS.OFFLINE_DATA);
  },

  async clearOfflineData(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
  },

  async addToOfflineQueue(action: any): Promise<void> {
    const offlineData = await this.getOfflineData() || { queue: [] };
    offlineData.queue.push({
      ...action,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substring(2),
    });
    await this.setOfflineData(offlineData);
  },

  async getOfflineQueue(): Promise<any[]> {
    const offlineData = await this.getOfflineData();
    return offlineData?.queue || [];
  },

  async clearOfflineQueue(): Promise<void> {
    const offlineData = await this.getOfflineData() || {};
    offlineData.queue = [];
    await this.setOfflineData(offlineData);
  },

  async removeFromOfflineQueue(actionId: string): Promise<void> {
    const offlineData = await this.getOfflineData() || { queue: [] };
    offlineData.queue = offlineData.queue.filter((action: any) => action.id !== actionId);
    await this.setOfflineData(offlineData);
  },
};