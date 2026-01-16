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

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const appInfo = [
    { label: 'Version', value: '1.0.0' },
    { label: 'Build', value: '2024.01.10' },
    { label: 'Platform', value: 'React Native' },
    { label: 'License', value: 'MIT' },
  ];

  const teamMembers = [
    { name: 'Smart Home Team', role: 'Development Team' },
    { name: 'UI/UX Design', role: 'Design Team' },
    { name: 'Quality Assurance', role: 'Testing Team' },
  ];

  const links = [
    {
      icon: 'globe-outline',
      title: 'Website',
      subtitle: 'Visit our website',
      action: () => Linking.openURL('https://smarthome.com'),
    },
    {
      icon: 'document-text-outline',
      title: 'Privacy Policy',
      subtitle: 'Read our privacy policy',
      action: () => Linking.openURL('https://smarthome.com/privacy'),
    },
    {
      icon: 'document-outline',
      title: 'Terms of Service',
      subtitle: 'Read our terms of service',
      action: () => Linking.openURL('https://smarthome.com/terms'),
    },
    {
      icon: 'logo-github',
      title: 'Open Source',
      subtitle: 'View source code on GitHub',
      action: () => Linking.openURL('https://github.com/smarthome/app'),
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
          About
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          {/* App Logo and Name */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: '#3B82F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="home" size={40} color="white" />
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: isDark ? '#FFFFFF' : '#111827',
              marginBottom: 8,
            }}>
              Smart Home
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Your intelligent home inventory management companion
            </Text>
          </View>

          {/* App Information */}
          <View style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
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
              marginBottom: 16,
            }}>
              App Information
            </Text>

            {appInfo.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: index < appInfo.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                  {item.label}
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDark ? '#FFFFFF' : '#111827',
                }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Team */}
          <View style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
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
              marginBottom: 16,
            }}>
              Team
            </Text>

            {teamMembers.map((member, index) => (
              <View
                key={index}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: index < teamMembers.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#374151' : '#F3F4F6',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDark ? '#FFFFFF' : '#111827',
                  marginBottom: 2,
                }}>
                  {member.name}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                  {member.role}
                </Text>
              </View>
            ))}
          </View>

          {/* Links */}
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDark ? '#FFFFFF' : '#111827',
            marginBottom: 16,
          }}>
            Links
          </Text>

          {links.map((link, index) => (
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
              onPress={link.action}
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
                  name={link.icon as any} 
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
                  {link.title}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}>
                  {link.subtitle}
                </Text>
              </View>
              
              <Ionicons 
                name="open-outline" 
                size={20} 
                color={isDark ? '#6B7280' : '#9CA3AF'} 
              />
            </TouchableOpacity>
          ))}

          {/* Copyright */}
          <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              color: isDark ? '#6B7280' : '#9CA3AF',
              textAlign: 'center',
            }}>
              © 2024 Smart Home. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}