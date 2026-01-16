import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateHouseScreen() {
  const { colors, isDark } = useTheme();
  const [houseName, setHouseName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateHouse = async () => {
    if (!houseName.trim()) {
      Alert.alert('Error', 'Please enter a house name');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      if (!token) {
        console.error('No auth token');
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateHouse($input: CreateHouseInput!) {
              createHouse(input: $input) {
                id
                name
                description
                createdDate
              }
            }
          `,
          variables: {
            input: {
              name: houseName.trim(),
              description: description.trim() || null,
            },
          },
        }),
      });

      const data = await response.json();
      console.log('🏠 Create house response:', JSON.stringify(data, null, 2));

      if (data.data?.createHouse) {
        const newHouse = data.data.createHouse;
        
        // Save selected house to AsyncStorage
        await AsyncStorage.setItem('selectedHouseId', newHouse.id);
        await AsyncStorage.setItem('selectedHouseName', newHouse.name);
        
        console.log('✅ Created and selected house:', newHouse.name);
        
        // Navigate to dashboard
        router.replace('/(tabs)');
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        Alert.alert('Error', data.errors[0]?.message || 'Failed to create house');
      }
    } catch (error) {
      console.error('Error creating house:', error);
      Alert.alert('Error', 'Failed to create house');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/select-house');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}
              >
                <Ionicons name="home" size={50} color="white" />
              </LinearGradient>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: colors.text,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Create Your House
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                Set up your first house to start managing your smart home inventory
              </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
              {/* House Name Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  House Name *
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                  }}
                >
                  <Ionicons
                    name="home-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    value={houseName}
                    onChangeText={setHouseName}
                    placeholder="e.g., My Home, Beach House, etc."
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: colors.text,
                    }}
                  />
                </View>
              </View>

              {/* Description Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  Description (Optional)
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                  }}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={colors.textSecondary}
                    style={{ marginRight: 12, marginTop: 16 }}
                  />
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add a description for your house..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: colors.text,
                      minHeight: 100,
                    }}
                  />
                </View>
              </View>

              {/* Info Box */}
              <View
                style={{
                  backgroundColor: '#3B82F6' + '10',
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  marginBottom: 32,
                }}
              >
                <Ionicons
                  name="information-circle"
                  size={24}
                  color="#3B82F6"
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: colors.text,
                    lineHeight: 20,
                  }}
                >
                  You can create multiple houses and switch between them anytime from the dashboard.
                </Text>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                onPress={handleCreateHouse}
                disabled={loading || !houseName.trim()}
                style={{
                  opacity: loading || !houseName.trim() ? 0.5 : 1,
                }}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: 'white',
                        }}
                      >
                        Create House
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Skip Button */}
              <TouchableOpacity
                onPress={handleSkip}
                disabled={loading}
                style={{
                  marginTop: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}
                >
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
