import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { ProfileAvatar } from '@/components/ui/Avatar';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Profile',
      subtitle: 'Edit your personal information',
      icon: 'person-outline',
      onPress: () => router.push('/profile'),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications-outline',
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark themes',
      icon: 'moon-outline',
      type: 'toggle',
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Help', 'Help & Support coming soon!'),
    },
    {
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle-outline',
      onPress: () => Alert.alert('About', 'Smart Home App v1.0.0'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.profileContent}>
            <ProfileAvatar 
              user={user || undefined} 
              size={64} 
              variant="primary" 
            />
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
            
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Ionicons name="create-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Items */}
        <View style={[styles.settingsCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.settingItem,
                index < settingsItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                }
              ]}
              onPress={item.onPress}
              disabled={item.type === 'toggle'}
            >
              <View style={[styles.settingIcon, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <Ionicons name={item.icon as any} size={20} color="#6B7280" />
              </View>
              
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {item.subtitle}
                </Text>
              </View>
              
              {item.type === 'toggle' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}
          onPress={handleLogout}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          
          <View style={styles.settingContent}>
            <Text style={styles.signOutText}>Sign Out</Text>
            <Text style={[styles.settingSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Sign out of your account
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginBottom: 2,
  },
});