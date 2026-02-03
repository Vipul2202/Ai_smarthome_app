import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CreateHouseScreen() {
  const { colors, isDark } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🚫 User not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [user, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner overlay text="Loading..." />;
  }

  // Don't render if user is not authenticated
  if (!user) {
    return <LoadingSpinner overlay text="Redirecting to login..." />;
  }

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'House name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'House name must be at least 2 characters';
    }
    
    // Description is now optional - no validation required
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateHouse = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';
      
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login again.');
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
                userId
                name
                description
                createdDate
                updatedAt
              }
            }
          `,
          variables: {
            input: {
              name: name.trim(),
              description: description.trim() || null
            }
          }
        }),
      });

      const data = await response.json();
      
      if (data.data?.createHouse) {
        const newHouse = data.data.createHouse;
        
        // Save the new house as selected
        await AsyncStorage.setItem('selectedHouseId', newHouse.id);
        await AsyncStorage.setItem('selectedHouseName', newHouse.name);
        
        Alert.alert(
          'Success',
          'House created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        const error = data.errors[0];
        Alert.alert('Error', error?.message || 'Failed to create house. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create house. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create house:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // For development, allow skipping house creation
    Alert.alert(
      'Skip House Creation',
      'You can create a house later from the settings. Continue to dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}>
            Create Your First House
          </Text>
          <Text style={{
            fontSize: 14,
            marginTop: 2,
            color: colors.textSecondary,
          }}>
            Let's set up your smart home
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* House Icon */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'CC']}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 50 }}>🏠</Text>
            </LinearGradient>
          </View>

          {/* Form */}
          <View style={{ flex: 1 }}>
            {/* House Name Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
                color: colors.text,
              }}>
                House Name <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderWidth: 1,
                backgroundColor: colors.surface,
                borderColor: errors.name ? colors.error : colors.border,
              }}>
                <Ionicons name="home-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 12,
                    color: colors.text,
                  }}
                  placeholder="e.g., My Home, Summer House"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && (
                <Text style={{ fontSize: 14, marginTop: 4, color: colors.error }}>
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Description Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
                color: colors.text,
              }}>
                Description <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>(Optional)</Text>
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderWidth: 1,
                backgroundColor: colors.surface,
                borderColor: errors.description ? colors.error : colors.border,
              }}>
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color={colors.textSecondary}
                  style={{ marginTop: 2 }}
                />
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 16,
                    marginLeft: 12,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    color: colors.text,
                  }}
                  placeholder="Describe your house (rooms, features, etc.)"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description) setErrors({ ...errors, description: undefined });
                  }}
                  multiline
                  numberOfLines={4}
                />
              </View>
              {errors.description && (
                <Text style={{ fontSize: 14, marginTop: 4, color: colors.error }}>
                  {errors.description}
                </Text>
              )}
            </View>

            {/* Example Houses */}
            <View style={{
              padding: 16,
              borderRadius: 12,
              marginBottom: 32,
              borderWidth: 1,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 12,
                color: colors.text,
              }}>
                Example Houses:
              </Text>
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  marginBottom: 8,
                }}
                onPress={() => {
                  setName('Family Home');
                  setDescription('Main family house with kitchen, living room, 3 bedrooms, and 2 bathrooms');
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 2,
                  color: colors.text,
                }}>
                  🏡 Family Home
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                }}>
                  Main family house with kitchen, living room, 3 bedrooms...
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ paddingVertical: 8 }}
                onPress={() => {
                  setName('Vacation Cabin');
                  setDescription('Cozy cabin in the mountains with fireplace, kitchen, and outdoor deck');
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 2,
                  color: colors.text,
                }}>
                  🏔️ Vacation Cabin
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                }}>
                  Cozy cabin in the mountains with fireplace, kitchen...
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                opacity: isLoading ? 0.6 : 1,
              }}
              onPress={handleCreateHouse}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  gap: 8,
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: 'white',
                }}>
                  {isLoading ? 'Creating...' : 'Create House'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                alignItems: 'center',
                marginBottom: 40,
              }}
              onPress={handleSkipForNow}
            >
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
              }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}