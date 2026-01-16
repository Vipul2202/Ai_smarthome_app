import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { router, useFocusEffect } from 'expo-router';
import ThemeToggle from '@/components/ui/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedHouseName, setSelectedHouseName] = useState('My Home');

  // Load selected house name on mount
  useEffect(() => {
    loadSelectedHouse();
  }, []);

  // Reload house name when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSelectedHouse();
    }, [])
  );

  const loadSelectedHouse = async () => {
    try {
      const houseName = await AsyncStorage.getItem('selectedHouseName');
      if (houseName) {
        setSelectedHouseName(houseName);
      }
    } catch (error) {
      console.error('Error loading house name:', error);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const quickActions = [
    { 
      icon: 'add-circle', 
      title: 'Add Item', 
      color: '#10B981',
      route: '/inventory/add'
    },
    { 
      icon: 'scan', 
      title: 'Scan Barcode', 
      color: '#3B82F6',
      route: '/inventory/scan'
    },
    { 
      icon: 'list', 
      title: 'View All', 
      color: '#8B5CF6',
      route: '/inventory'
    },
  ];

  const stats = [
    { label: 'Total Items', value: '127', icon: 'cube', color: '#3B82F6', route: '/inventory' },
    { label: 'Expiring Soon', value: '8', icon: 'warning', color: '#F59E0B', route: '/inventory?filter=expiring' },
    { label: 'Low Stock', value: '5', icon: 'alert-circle', color: '#EF4444', route: '/inventory?filter=low-stock' },
  ];

  const features = [
    { icon: 'restaurant', title: 'Recipes', subtitle: 'AI-powered recipe generation', color: '#EC4899', route: '/recipes' },
    { icon: 'calendar', title: 'Meal Planning', subtitle: 'Plan your weekly meals', color: '#8B5CF6', route: '/meal-planning' },
    { icon: 'card', title: 'Expenses', subtitle: 'Track grocery spending', color: '#F59E0B', route: '/expenses' },
    { icon: 'bar-chart', title: 'Analytics', subtitle: 'Insights and reports', color: '#06B6D4', route: '/analytics' },
    { icon: 'leaf', title: 'Waste Tracking', subtitle: 'Reduce food waste', color: '#10B981', route: '/waste-tracking' },
    { icon: 'timer', title: 'Kitchen Timer', subtitle: 'Cooking timers', color: '#F97316', route: '/timer' },
  ];

  const recentActivity = [
    { icon: 'add-circle', text: 'Added Milk to inventory', time: '2 hours ago', color: '#10B981' },
    { icon: 'warning', text: 'Bread expires tomorrow', time: '4 hours ago', color: '#F59E0B' },
    { icon: 'restaurant', text: 'Generated pasta recipe', time: '2 days ago', color: '#EC4899' },
  ];

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleStatPress = (route: string) => {
    router.push(route as any);
  };

  const handleFeaturePress = (route: string) => {
    router.push(route as any);
  };

  const truncateText = (text: string, maxLength: number = 15) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          {/* House Name Display */}
          <TouchableOpacity
            onPress={() => router.push('/select-house' as any)}
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
              borderWidth: 1,
              borderColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#3B82F6' + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="home" size={22} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 2 }}>
                  Current House
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: isDark ? '#F9FAFB' : '#111827',
                  }}
                  numberOfLines={1}
                >
                  {selectedHouseName}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
              }}>
                Good {getGreeting()}! 👋
              </Text>
              <Text style={{
                fontSize: 16,
                color: colors.textSecondary,
              }}>
                Welcome back, {truncateText(user?.name || 'User')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ThemeToggle />
              <TouchableOpacity 
                style={{ padding: 8 }}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Control - Featured */}
          <View style={{ marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => router.push('/voice-control')}
              style={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderRadius: 20,
                padding: 24,
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
                borderWidth: 2,
                borderColor: '#8B5CF6',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="mic" size={32} color="white" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{
                      fontSize: 22,
                      fontWeight: 'bold',
                      color: colors.text,
                    }}>
                      Voice Control
                    </Text>
                    <View style={{
                      backgroundColor: '#8B5CF6',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}>
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>NEW</Text>
                    </View>
                  </View>
                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}>
                    Manage your inventory hands-free
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: '#8B5CF6',
                    fontWeight: '600',
                  }}>
                    Tap to start speaking →
                  </Text>
                </View>
              </View>
             
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
              color: colors.text,
            }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                  onPress={() => handleQuickAction(action.route)}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      backgroundColor: action.color + '20',
                    }}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '500',
                      textAlign: 'center',
                      color: colors.text,
                    }}>
                      {action.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Grid */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
              color: isDark ? '#FFFFFF' : '#111827',
            }}>
              Overview
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {stats.map((stat, index) => (
                <View key={index} style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
                  <TouchableOpacity 
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                    onPress={() => handleStatPress(stat.route)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: stat.color + '20',
                      }}>
                        <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                      </View>
                      <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: isDark ? '#FFFFFF' : '#111827',
                      }}>
                        {stat.value}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: isDark ? '#9CA3AF' : '#6B7280',
                    }}>
                      {stat.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Features Grid */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
              color: isDark ? '#FFFFFF' : '#111827',
            }}>
              Features
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
              {features.map((feature, index) => (
                <View key={index} style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
                  <TouchableOpacity 
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                    onPress={() => handleFeaturePress(feature.route)}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      backgroundColor: feature.color + '20',
                    }}>
                      <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                    </View>
                    <Text style={{
                      fontWeight: '600',
                      marginBottom: 4,
                      color: isDark ? '#FFFFFF' : '#111827',
                    }}>
                      {feature.title}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: isDark ? '#9CA3AF' : '#6B7280',
                    }}>
                      {feature.subtitle}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: isDark ? '#FFFFFF' : '#111827',
              }}>
                Recent Activity
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/inventory' as any)}>
                <Text style={{ color: '#3B82F6', fontWeight: '500' }}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{
              borderRadius: 16,
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}>
              {recentActivity.map((activity, index) => (
                <View key={index} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: index < recentActivity.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    backgroundColor: activity.color + '20',
                  }}>
                    <Ionicons name={activity.icon as any} size={20} color={activity.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontWeight: '500',
                      color: isDark ? '#FFFFFF' : '#111827',
                    }}>
                      {activity.text}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: isDark ? '#9CA3AF' : '#6B7280',
                    }}>
                      {activity.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* AI Suggestions */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 16,
              color: isDark ? '#FFFFFF' : '#111827',
            }}>
              AI Suggestions
            </Text>
            <LinearGradient
              colors={['#3B82F6', '#1E40AF']}
              style={{ padding: 16, borderRadius: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="bulb" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Smart Tip</Text>
              </View>
              <Text style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                You have 3 items expiring this week. Consider using them in tonight's dinner or add them to your meal plan.
              </Text>
              <TouchableOpacity 
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignSelf: 'flex-start',
                }}
                onPress={() => router.push('/meal-planning')}
              >
                <Text style={{ color: 'white', fontWeight: '500' }}>View Suggestions</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}