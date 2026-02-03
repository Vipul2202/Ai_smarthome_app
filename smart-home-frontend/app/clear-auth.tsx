import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClearAuthScreen() {
  const { colors } = useTheme();

  const handleClearAuth = async () => {
    try {
      console.log('🗑️ Clearing all authentication data...');
      
      // Clear all possible auth-related keys
      await AsyncStorage.multiRemove([
        'authToken',
        'userData', 
        'tokenExpiry',
        'selectedHouseId',
        'selectedHouseName',
        'selectedHouse'
      ]);
      
      // Also clear all keys (nuclear option)
      const allKeys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(allKeys);
      
      Alert.alert(
        'Success', 
        'All authentication data cleared. App will restart.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigate to login
              router.replace('/(auth)/login');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error clearing auth data:', error);
      Alert.alert('Error', 'Failed to clear auth data');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: colors.text, 
          marginBottom: 20,
          textAlign: 'center'
        }}>
          Clear Authentication Data
        </Text>
        
        <Text style={{ 
          fontSize: 16, 
          color: colors.textSecondary, 
          marginBottom: 40,
          textAlign: 'center'
        }}>
          This will clear all stored authentication data and force the app to show the login screen.
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: '#EF4444',
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 8,
            marginBottom: 20,
          }}
          onPress={handleClearAuth}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
            Clear All Data
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}