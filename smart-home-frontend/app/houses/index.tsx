import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { useHouse } from '@/contexts/HouseContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SmartHomeLoading } from '@/components/ui/SmartHomeLoading';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HousesScreen() {
  const { colors, isDark } = useTheme();
  const { houses, selectedHouse, isLoading, loadHouses, setSelectedHouse } = useHouse();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load houses when component mounts
    loadHouses();
  }, []);

  // Also reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHouses();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHouses();
    setRefreshing(false);
  };

  const handleSelectHouse = async (house: any) => {
    try {
      // Set the selected house in context
      await setSelectedHouse(house);
      
      // Store house selection for app routing
      await AsyncStorage.setItem('selectedHouseId', house.id);
      await AsyncStorage.setItem('selectedHouseName', house.name);
      
      Alert.alert(
        'House Selected',
        `You've selected "${house.name}" as your active house.`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error selecting house:', error);
      Alert.alert('Error', 'Failed to select house. Please try again.');
    }
  };

  const handleCreateHouse = () => {
    router.push('/houses/create');
  };

  if (isLoading && houses.length === 0) {
    return <SmartHomeLoading text="Loading your houses..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#374151' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
          }}>
            My Houses 🏠
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 32,
          }}>
            Select a house to manage or create a new one
          </Text>

          {/* Current Selection */}
          {selectedHouse && (
            <View style={{
              backgroundColor: isDark ? '#1F2937' : '#F0F9FF',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 2,
              borderColor: '#3B82F6',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" style={{ marginRight: 12 }} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.text,
                }}>
                  Currently Selected
                </Text>
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 4,
              }}>
                {selectedHouse.name}
              </Text>
              {selectedHouse.description && (
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                }}>
                  {selectedHouse.description}
                </Text>
              )}
            </View>
          )}

          {/* Create New House Button */}
          <TouchableOpacity onPress={handleCreateHouse} style={{ marginBottom: 24 }}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={{
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="add-circle" size={24} color="white" style={{ marginRight: 12 }} />
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: 'white',
              }}>
                Create New House
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Houses List */}
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 16,
          }}>
            All Houses ({houses.length})
          </Text>

          {houses.length === 0 ? (
            <View style={{
              backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
              borderRadius: 16,
              padding: 32,
              alignItems: 'center',
            }}>
              <Ionicons name="home-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                No Houses Yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 24,
              }}>
                Create your first house to start managing your smart home inventory
              </Text>
              <TouchableOpacity onPress={handleCreateHouse}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="add" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: 'white',
                  }}>
                    Create House
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {houses.map((house) => (
                <TouchableOpacity
                  key={house.id}
                  onPress={() => handleSelectHouse(house)}
                  style={{
                    backgroundColor: selectedHouse?.id === house.id 
                      ? (isDark ? '#1E3A8A' : '#EBF8FF')
                      : (isDark ? '#1F2937' : '#FFFFFF'),
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: selectedHouse?.id === house.id ? 2 : 1,
                    borderColor: selectedHouse?.id === house.id 
                      ? '#3B82F6' 
                      : (isDark ? '#374151' : '#E5E7EB'),
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons 
                          name="home" 
                          size={24} 
                          color={selectedHouse?.id === house.id ? '#3B82F6' : colors.textSecondary}
                          style={{ marginRight: 12 }} 
                        />
                        <Text style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: selectedHouse?.id === house.id ? '#3B82F6' : colors.text,
                        }}>
                          {house.name}
                        </Text>
                      </View>
                      
                      {house.description && (
                        <Text style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          marginBottom: 8,
                          marginLeft: 36,
                        }}>
                          {house.description}
                        </Text>
                      )}
                      
                      <Text style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginLeft: 36,
                      }}>
                        Created {new Date(house.createdDate).toLocaleDateString()}
                      </Text>
                    </View>

                    {selectedHouse?.id === house.id ? (
                      <View style={{
                        backgroundColor: '#3B82F6',
                        borderRadius: 20,
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons name="checkmark" size={24} color="white" />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}