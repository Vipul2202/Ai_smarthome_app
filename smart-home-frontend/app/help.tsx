import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const helpItems = [
    {
      icon: 'book-outline',
      title: 'Getting Started',
      subtitle: 'Learn the basics of using Smart Home',
      action: () => console.log('Getting Started'),
    },
    {
      icon: 'scan-outline',
      title: 'Barcode Scanning',
      subtitle: 'How to scan and add items to your inventory',
      action: () => console.log('Barcode Scanning'),
    },
    {
      icon: 'notifications-outline',
      title: 'Managing Notifications',
      subtitle: 'Set up alerts for expiry dates and low stock',
      action: () => console.log('Managing Notifications'),
    },
    {
      icon: 'restaurant-outline',
      title: 'Recipe Features',
      subtitle: 'Discover and save recipes based on your inventory',
      action: () => console.log('Recipe Features'),
    },
    {
      icon: 'chatbubble-outline',
      title: 'Contact Support',
      subtitle: 'Get help from our support team',
      action: () => Linking.openURL('mailto:support@smarthome.com'),
    },
    {
      icon: 'bug-outline',
      title: 'Report a Bug',
      subtitle: 'Let us know about any issues you encounter',
      action: () => Linking.openURL('mailto:bugs@smarthome.com'),
    },
  ];

  const faqItems = [
    {
      question: 'How do I add items to my inventory?',
      answer: 'You can add items by scanning barcodes, taking photos, or manually entering item details in the Inventory tab.',
    },
    {
      question: 'Can I share my inventory with family members?',
      answer: 'Yes! You can invite family members to join your household and share inventory management.',
    },
    {
      question: 'How do expiry notifications work?',
      answer: 'The app will send you notifications when items are approaching their expiry date. You can customize these settings in Notifications.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your data. Your information is never shared with third parties.',
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
          Help & Support
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* Help Topics */}
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? '#FFFFFF' : '#111827',
            marginBottom: 16,
          }}>
            Help Topics
          </Text>

          {helpItems.map((item, index) => (
            <TouchableOpacity
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
              onPress={item.action}
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

          {/* FAQ Section */}
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? '#FFFFFF' : '#111827',
            marginTop: 32,
            marginBottom: 16,
          }}>
            Frequently Asked Questions
          </Text>

          {faqItems.map((item, index) => (
            <View
              key={index}
              style={{
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
              <Text style={{
                fontSize: 16,
                fontWeight: '500',
                color: isDark ? '#FFFFFF' : '#111827',
                marginBottom: 8,
              }}>
                {item.question}
              </Text>
              <Text style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
                lineHeight: 20,
              }}>
                {item.answer}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}