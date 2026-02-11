import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileAvatar } from '@/components/ui/Avatar';
import * as Clipboard from 'expo-clipboard';
import { Platform, ToastAndroid, Alert } from 'react-native';

export default function MoreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: 'person-outline', title: 'Profile', subtitle: 'Manage your account', route: '/profile' },
    { icon: 'settings-outline', title: 'Settings', subtitle: 'App preferences', route: '/settings' },
    { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Manage alerts', route: '/notifications' },
    { icon: 'help-circle-outline', title: 'Help & Support', subtitle: 'Get assistance', route: '/help' },
    { icon: 'information-circle-outline', title: 'About', subtitle: 'App information', route: '/about' },
  ];

  const debugItems = [
    { icon: 'trash-outline', title: 'Clear Auth Data', subtitle: 'Fix login issues', route: '/clear-auth', color: '#EF4444' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };
const handleCopyUserId = async () => {
  if (!user?.userId) return;

  await Clipboard.setStringAsync(user.userId);

  if (Platform.OS === 'android') {
    ToastAndroid.show('User ID copied', ToastAndroid.SHORT);
  } else {
    Alert.alert('Copied', 'User ID copied to clipboard');
  }

};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 24,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: isDark ? '#FFFFFF' : '#111827',
          marginBottom: 16,
        }}>
           Profile Setting
        </Text>
        
        {/* User Profile Section */}
        {user && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => router.push('/profile')}
          >
            <ProfileAvatar 
              user={user || undefined} 
              size={60} 
              variant="primary" 
            />
            
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: isDark ? '#FFFFFF' : '#111827',
              }}>
                {user.name}
              </Text>
              <Text style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginTop: 2,
              }}>
                {user.email}
              </Text>
              {user.userId && (
                <View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  }}
>
  <Text
    style={{
      fontSize: 13,
      fontWeight: '700', // bold
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontFamily: 'monospace',
      marginRight: 6,
    }}
  >
    User ID: {user.userId}
  </Text>

  <TouchableOpacity onPress={handleCopyUserId}>
    <Ionicons
      name="copy-outline"
      size={16}
      color={isDark ? '#60A5FA' : '#3B82F6'}
    />
  </TouchableOpacity>
</View>

              )}
            </View>
            
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDark ? '#6B7280' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Items */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingVertical: 16 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#374151' : '#F3F4F6',
              }}
              onPress={() => router.push(item.route as any)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={isDark ? '#9CA3AF' : '#6B7280'} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: 2,
                }}>
                  {item.title}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                  {item.subtitle}
                </Text>
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#6B7280' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          ))}
          
          {/* Debug/Troubleshooting Section */}
          <View style={{ 
            marginTop: 24, 
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}>
              Troubleshooting
            </Text>
          </View>

          {debugItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#374151' : '#F3F4F6',
              }}
              onPress={() => router.push(item.route as any)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: item.color + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={item.color} 
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: item.color,
                  marginBottom: 2,
                }}>
                  {item.title}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                  {item.subtitle}
                </Text>
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#6B7280' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          ))}
          
          {/* Logout Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              marginTop: 16,
            }}
            onPress={handleLogout}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FEE2E2',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
            }}>
              <Ionicons 
                name="log-out-outline" 
                size={20} 
                color="#EF4444" 
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#EF4444',
              }}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
