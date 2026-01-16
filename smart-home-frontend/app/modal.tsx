import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ModalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style="auto" />
      
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Modal Screen
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-600 dark:text-gray-400 text-center">
            This is a modal screen. You can use this for various modal presentations
            like adding items, editing profiles, or showing detailed views.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}