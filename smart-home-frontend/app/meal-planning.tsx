import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function MealPlanningScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedWeek, setSelectedWeek] = useState(0);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const mockMealPlan = {
    'Mon': {
      breakfast: { name: 'Oatmeal with Berries', time: '8:00 AM' },
      lunch: { name: 'Chicken Salad', time: '12:30 PM' },
      dinner: { name: 'Grilled Salmon', time: '7:00 PM' },
    },
    'Tue': {
      breakfast: { name: 'Greek Yogurt', time: '8:00 AM' },
      lunch: { name: 'Quinoa Bowl', time: '12:30 PM' },
      dinner: { name: 'Pasta Primavera', time: '7:00 PM' },
    },
    // Add more days as needed
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#F9FAFB' }}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={{ paddingHorizontal: 16, paddingVertical: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>Meal Planning</Text>
          <TouchableOpacity onPress={() => router.push('/meal-planning/add')}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Week Navigation */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={{
                marginRight: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: selectedWeek === index ? '#8B5CF6' : (isDark ? '#374151' : '#FFFFFF'),
                borderWidth: selectedWeek === index ? 0 : 1,
                borderColor: isDark ? '#4B5563' : '#E5E7EB',
              }}
              onPress={() => setSelectedWeek(index)}
            >
              <Text style={{
                fontWeight: '500',
                color: selectedWeek === index ? 'white' : (isDark ? '#D1D5DB' : '#374151'),
              }}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Meal Plan Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ paddingBottom: 20 }}>
          {['breakfast', 'lunch', 'dinner'].map((mealType) => (
            <Card key={mealType} containerStyle={{ marginBottom: 16 }}>
              <View style={{ padding: 16 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: 12,
                  textTransform: 'capitalize',
                }}>
                  {mealType}
                </Text>
                
                <View style={{
                  padding: 16,
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 80,
                }}>
                  <Ionicons name="add-circle-outline" size={32} color="#9CA3AF" />
                  <Text style={{
                    color: '#9CA3AF',
                    marginTop: 8,
                    fontSize: 14,
                  }}>
                    Add {mealType}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Quick Add FAB */}
      <TouchableOpacity
        onPress={() => router.push('/meal-planning/add')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          backgroundColor: '#8B5CF6',
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}