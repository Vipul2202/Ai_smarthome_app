import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({ children }) => {
  const { colors } = useTheme();
  const { logout } = useAuth();

  const handleAuthError = async () => {
    Alert.alert(
      'Authentication Error',
      'Your session has expired. Please login again.',
      [
        {
          text: 'Login',
          onPress: async () => {
            // Clear all auth data
            await AsyncStorage.multiRemove([
              'authToken',
              'userData', 
              'tokenExpiry',
              'selectedHouseId',
              'selectedHouseName',
              'selectedHouse'
            ]);
            
            // Navigate to login
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // This would be used with React Error Boundary in a real implementation
  // For now, we'll just render children
  return <>{children}</>;
};

// Helper function to handle auth errors globally
export const handleGlobalAuthError = async (error: any) => {
  if (error?.message?.toLowerCase().includes('authentication') ||
      error?.message?.toLowerCase().includes('unauthorized') ||
      error?.extensions?.code === 'UNAUTHORIZED') {
    
    console.log('🚫 Authentication error detected, clearing auth data');
    
    // Clear all auth data
    await AsyncStorage.multiRemove([
      'authToken',
      'userData', 
      'tokenExpiry',
      'selectedHouseId',
      'selectedHouseName',
      'selectedHouse'
    ]);
    
    // Navigate to login
    router.replace('/(auth)/login');
    
    return true; // Indicates error was handled
  }
  
  return false; // Error not handled
};