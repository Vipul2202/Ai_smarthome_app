import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [notifications, setNotifications] = useState({
    expiry: true,
    lowStock: true,
    recipes: true,
    updates: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationItems = [
    {
      key: 'expiry' as keyof typeof notifications,
      icon: 'time-outline',
      title: 'Expiry Alerts',
      subtitle: 'Get notified when items are about to expire',
    },
    {
      key: 'lowStock' as keyof typeof notifications,
      icon: 'alert-circle-outline',
      title: 'Low Stock Alerts',
      subtitle: 'Get notified when items are running low',
    },
    {
      key: 'recipes' as keyof typeof notifications,
      icon: 'restaurant-outline',
      title: 'Recipe Suggestions',
      subtitle: 'Get recipe suggestions based on your inventory',
    },
    {
      key: 'updates' as keyof typeof notifications,
      icon: 'information-circle-outline',
      title: 'App Updates',
      subtitle: 'Get notified about new features and updates',
    },
  ];

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
          Notifications
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <Text style={{
            fontSize: 16,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginBottom: 20,
          }}>
            Manage your notification preferences
          </Text>

          {notificationItems.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 20,
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
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
              
              <Switch
                value={notifications[item.key]}
                onValueChange={() => toggleNotification(item.key)}
                trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                thumbColor={notifications[item.key] ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}