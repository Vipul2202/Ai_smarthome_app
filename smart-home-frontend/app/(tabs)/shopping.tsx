import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function ShoppingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={{ paddingHorizontal: 16, paddingVertical: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Shopping Lists</Text>
          <TouchableOpacity onPress={() => router.push('/shopping/add')}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 32,
      }}>
        <Ionicons name="bag-outline" size={64} color="#9CA3AF" />
        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: isDark ? '#FFFFFF' : '#111827',
          marginTop: 16,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Shopping Lists
        </Text>
        <Text style={{
          fontSize: 16,
          color: isDark ? '#9CA3AF' : '#6B7280',
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 24,
        }}>
          Create and manage your shopping lists here. This feature is coming soon!
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#10B981',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => router.push('/shopping/add')}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}>
            Create Shopping List
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}