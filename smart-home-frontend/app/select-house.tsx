import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { router } from 'expo-router';
import { SmartHomeLoading } from '@/components/ui/SmartHomeLoading';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface House {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
}

export default function SelectHouseScreen() {
  const { colors, isDark } = useTheme();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);

  useEffect(() => {
    fetchHouses();
    loadSelectedHouse();
  }, []);

  const loadSelectedHouse = async () => {
    try {
      const houseId = await AsyncStorage.getItem('selectedHouseId');
      if (houseId) {
        setSelectedHouseId(houseId);
      }
    } catch (error) {
      console.error('Error loading selected house:', error);
    }
  };

  const fetchHouses = async () => {
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
            query GetHouses {
              houses {
                id
                name
                description
                createdDate
              }
            }
          `,
        }),
      });

      const data = await response.json();
      console.log('🏠 Houses response:', JSON.stringify(data, null, 2));

      if (data.data?.houses) {
        setHouses(data.data.houses);
        
        // If no houses, redirect to create house
        if (data.data.houses.length === 0) {
          router.replace('/create-house');
        }
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        Alert.alert('Error', 'Failed to load houses');
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
      Alert.alert('Error', 'Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHouse = async (house: House) => {
    try {
      // Save selected house to AsyncStorage
      await AsyncStorage.setItem('selectedHouseId', house.id);
      await AsyncStorage.setItem('selectedHouseName', house.name);
      
      console.log('✅ Selected house:', house.name);
      
      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error selecting house:', error);
      Alert.alert('Error', 'Failed to select house');
    }
  };

  const handleCreateNewHouse = () => {
    router.push('/create-house');
  };

  if (loading) {
    return <SmartHomeLoading text="Loading your houses..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#3B82F6' + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="home" size={40} color="#3B82F6" />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Select Your House
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              Choose which house you want to manage
            </Text>
          </View>

          {/* Houses List */}
          <View style={{ marginBottom: 24 }}>
            {houses.map((house) => (
              <TouchableOpacity
                key={house.id}
                onPress={() => handleSelectHouse(house)}
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderWidth: selectedHouseId === house.id ? 2 : 1,
                  borderColor: selectedHouseId === house.id ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      backgroundColor: '#3B82F6' + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Ionicons name="home" size={28} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {house.name}
                    </Text>
                    {house.description && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                        }}
                        numberOfLines={2}
                      >
                        {house.description}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      Created {new Date(house.createdDate).toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedHouseId === house.id && (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#3B82F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 12,
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Create New House Button */}
          <TouchableOpacity
            onPress={handleCreateNewHouse}
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 2,
              borderColor: '#10B981',
              borderStyle: 'dashed',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#10B981' + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="add" size={24} color="#10B981" />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#10B981',
                }}
              >
                Create New House
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
