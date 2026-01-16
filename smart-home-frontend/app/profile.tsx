import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/Avatar';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      await updateUser({ name: name.trim(), email });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isDark ? '#FFFFFF' : '#111827'} 
          />
        </TouchableOpacity>
        
        <Text style={{
          flex: 1,
          fontSize: 20,
          fontWeight: '600',
          color: isDark ? '#FFFFFF' : '#111827',
        }}>
          Profile
        </Text>
        
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={{ color: '#3B82F6', fontWeight: '500' }}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 24 }}>
          {/* Avatar Section */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{ position: 'relative' }}>
              <ProfileAvatar 
                user={user || undefined} 
                size={120} 
                variant="primary" 
              />
              
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#3B82F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: isDark ? '#111827' : '#FFFFFF',
                }}
                onPress={() => Alert.alert('Coming Soon', 'Photo upload feature will be available soon')}
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: isDark ? '#FFFFFF' : '#111827',
              marginTop: 16,
            }}>
              {user?.name || 'User'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginTop: 4,
            }}>
              {user?.email}
            </Text>
          </View>

          {/* Profile Form */}
          <View style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: isDark ? '#FFFFFF' : '#111827',
              marginBottom: 20,
            }}>
              Personal Information
            </Text>

            <View style={{ gap: 16 }}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                editable={isEditing}
                placeholder="Enter your full name"
                leftIcon="person-outline"
              />

              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                editable={false} // Email should not be editable
                placeholder="Enter your email"
                leftIcon="mail-outline"
                keyboardType="email-address"
              />
            </View>

            {isEditing && (
              <View style={{ 
                flexDirection: 'row', 
                gap: 12, 
                marginTop: 24 
              }}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={handleCancel}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Save"
                  onPress={handleSave}
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>

          {/* Account Stats */}
          <View style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginTop: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: isDark ? '#FFFFFF' : '#111827',
              marginBottom: 20,
            }}>
              Account Statistics
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#3B82F6',
                }}>
                  127
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginTop: 4,
                }}>
                  Items Added
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#10B981',
                }}>
                  23
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginTop: 4,
                }}>
                  Days Active
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#F59E0B',
                }}>
                  $245
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginTop: 4,
                }}>
                  Saved
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}