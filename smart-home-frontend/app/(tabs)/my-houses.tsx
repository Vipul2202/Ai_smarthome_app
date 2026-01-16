import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface House {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdDate: string;
}

export default function MyHousesScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHouses();
  }, []);

  const loadHouses = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual GraphQL query
      // const response = await client.query({
      //   query: GET_HOUSES,
      // });
      
      // Mock data for development
      const mockHouses: House[] = [
        {
          id: '1',
          userId: user?.id || '1',
          name: 'My Home',
          description: 'Main family house with kitchen, living room, and bedrooms',
          createdDate: new Date().toISOString(),
        },
        {
          id: '2',
          userId: user?.id || '1',
          name: 'Summer House',
          description: 'Vacation home by the lake with beautiful views',
          createdDate: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          userId: user?.id || '1',
          name: 'Office Space',
          description: 'Small office with kitchen and meeting room',
          createdDate: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      
      setHouses(mockHouses);
    } catch (error) {
      console.error('Failed to load houses:', error);
      Alert.alert('Error', 'Failed to load houses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHouses();
    setRefreshing(false);
  };

  const handleSelectHouse = (house: House) => {
    // TODO: Set selected house in context/storage
    Alert.alert('House Selected', `You selected ${house.name}`);
  };

  const handleCreateHouse = () => {
    router.push('/houses/create');
  };

  const handleEditHouse = (house: House) => {
    router.push(`/houses/${house.id}`);
  };

  const handleDeleteHouse = (house: House) => {
    Alert.alert(
      'Delete House',
      `Are you sure you want to delete "${house.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete functionality
            setHouses(houses.filter(h => h.id !== house.id));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderHouseCard = ({ item }: { item: House }) => (
    <TouchableOpacity
      style={[styles.houseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleSelectHouse(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[colors.primary + '15', colors.primary + '05']}
        style={styles.houseCardGradient}
      >
        <View style={styles.houseCardContent}>
          <View style={styles.houseIcon}>
            <Text style={styles.houseEmoji}>🏠</Text>
          </View>
          
          <View style={styles.houseInfo}>
            <Text style={[styles.houseName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.houseDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={[styles.houseDate, { color: colors.textSecondary }]}>
              Created {formatDate(item.createdDate)}
            </Text>
          </View>
          
          <View style={styles.houseActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.background }]}
              onPress={() => handleEditHouse(item)}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
              onPress={() => handleDeleteHouse(item)}
            >
              <Ionicons name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleSelectHouse(item)}
            >
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Houses</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage your properties
          </Text>
        </View>
        <View style={styles.headerRight}>
          <ThemeToggle />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateHouse}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {houses.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="home-outline" size={48} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Houses Yet</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Create your first house to start managing your smart home inventory
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateHouse}>
              <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                style={styles.createGradient}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createButtonText}>Create House</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={houses}
            renderItem={renderHouseCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContainer: {
    paddingBottom: 100,
  },
  houseCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  houseCardGradient: {
    padding: 20,
  },
  houseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  houseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  houseEmoji: {
    fontSize: 30,
  },
  houseInfo: {
    flex: 1,
  },
  houseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  houseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  houseDate: {
    fontSize: 12,
  },
  houseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});