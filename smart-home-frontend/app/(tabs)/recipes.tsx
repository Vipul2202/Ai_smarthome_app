import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function RecipesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <LinearGradient
        colors={['#EC4899', '#BE185D']}
        style={{ paddingHorizontal: 16, paddingVertical: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Recipes</Text>
          <TouchableOpacity onPress={() => router.push('/recipes/search')}>
            <Ionicons name="search" size={24} color="white" />
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
        <Ionicons name="restaurant-outline" size={64} color="#9CA3AF" />
        <Text style={{
          fontSize: 20,
          fontWeight: '600',
          color: isDark ? '#FFFFFF' : '#111827',
          marginTop: 16,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Recipe Browser
        </Text>
        <Text style={{
          fontSize: 16,
          color: isDark ? '#9CA3AF' : '#6B7280',
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 24,
        }}>
          Discover delicious recipes based on your inventory. AI-powered recipe suggestions coming soon!
        </Text>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#EC4899',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => router.push('/recipes/search')}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}>
            Browse Recipes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}