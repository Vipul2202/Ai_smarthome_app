import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DebugAuthScreen() {
  const { user, isLoading, logout } = useAuth();
  const { colors } = useTheme();
  const [authData, setAuthData] = useState<any>({});

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
      const selectedHouseId = await AsyncStorage.getItem('selectedHouseId');
      
      setAuthData({
        token: token ? `${token.substring(0, 20)}...` : null,
        userData: userData ? JSON.parse(userData) : null,
        tokenExpiry,
        selectedHouseId,
      });
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  };

  const handleClearAuth = async () => {
    try {
      await AsyncStorage.multiRemove([
        'authToken',
        'userData', 
        'tokenExpiry',
        'selectedHouseId',
        'selectedHouseName',
        'selectedHouse'
      ]);
      
      Alert.alert('Success', 'Authentication data cleared');
      loadAuthData();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear auth data');
    }
  };

  const handleLogout = async () => {
    await logout();
    Alert.alert('Success', 'Logged out successfully');
    loadAuthData();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 }}>
          Debug Authentication
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
            Current State:
          </Text>
          <Text style={{ color: colors.text }}>
            User: {user ? user.email : 'Not authenticated'}
          </Text>
          <Text style={{ color: colors.text }}>
            Loading: {isLoading ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
            Stored Data:
          </Text>
          <Text style={{ color: colors.text, fontSize: 12, fontFamily: 'monospace' }}>
            {JSON.stringify(authData, null, 2)}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go to Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#10B981',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={loadAuthData}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Refresh Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#F59E0B',
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={handleClearAuth}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Clear Auth Data</Text>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              style={{
                backgroundColor: '#EF4444',
                padding: 15,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleLogout}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              padding: 15,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => router.back()}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}