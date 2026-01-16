import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/types';

const CATEGORIES = [
  { id: 'fruits', label: 'Fruits', icon: 'leaf', color: '#10B981' },
  { id: 'vegetables', label: 'Vegetables', icon: 'nutrition', color: '#059669' },
  { id: 'dairy', label: 'Dairy', icon: 'water', color: '#3B82F6' },
  { id: 'meat', label: 'Meat', icon: 'restaurant', color: '#EF4444' },
  { id: 'grains', label: 'Grains', icon: 'ellipse', color: '#F59E0B' },
  { id: 'beverages', label: 'Beverages', icon: 'wine', color: '#8B5CF6' },
  { id: 'snacks', label: 'Snacks', icon: 'fast-food', color: '#EC4899' },
  { id: 'other', label: 'Other', icon: 'cube', color: '#6B7280' },
];

export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'uncategorized'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUnit, setEditUnit] = useState('');

  const {
    items,
    allItems,
    loading,
    deleteItem,
    updateItem,
    refetch,
    deletingItem,
    updatingItem,
  } = useInventory();

  const colors = {
    background: isDark ? '#111827' : '#F9FAFB',
    surface: isDark ? '#1F2937' : '#FFFFFF',
    text: isDark ? '#F9FAFB' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    border: isDark ? '#374151' : '#E5E7EB',
  };

  // Filter items based on active tab and search
  const getFilteredItems = () => {
    let filtered = allItems;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab === 'uncategorized') {
      filtered = filtered.filter(item => !item.category || item.category === '' || item.category === 'other');
    } else if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Get category counts
  const getCategoryCount = (categoryId: string) => {
    return allItems.filter(item => item.category === categoryId).length;
  };

  const getUncategorizedCount = () => {
    return allItems.filter(item => !item.category || item.category === '' || item.category === 'other').length;
  };

  const handleView = (item: InventoryItem) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditQuantity(item.quantity.toString());
    setEditCategory(item.category || 'other');
    setEditUnit(item.unit || 'pieces');
    setShowEditModal(true);
  };

  const handleDelete = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteItem(item.id);
            if (result.success) {
              Alert.alert('Success', 'Item deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const result = await updateItem(editingItem.id, {
      name: editName,
      quantity: parseFloat(editQuantity) || 0,
      category: editCategory,
      unit: editUnit,
    });

    if (result.success) {
      setShowEditModal(false);
      setEditingItem(null);
      Alert.alert('Success', 'Item updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const getCategoryIcon = (category: string | null) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : 'cube';
  };

  const getCategoryColor = (category: string | null) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.color : '#6B7280';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.text }}>
              Inventory
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/voice-control')}
              style={{
                backgroundColor: '#8B5CF6',
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons name="mic" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search items..."
              placeholderTextColor={colors.textSecondary}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 12,
                fontSize: 16,
                color: colors.text,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Categories Horizontal Scroll */}
          <View style={{ marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -8 }}>
              {/* All Items */}
              <TouchableOpacity
                onPress={() => {
                  setActiveTab('all');
                  setSelectedCategory(null);
                }}
                style={{
                  marginHorizontal: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: activeTab === 'all' && !selectedCategory ? '#3B82F6' : colors.surface,
                  borderWidth: 1,
                  borderColor: activeTab === 'all' && !selectedCategory ? '#3B82F6' : colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons 
                  name="apps" 
                  size={16} 
                  color={activeTab === 'all' && !selectedCategory ? 'white' : '#3B82F6'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: activeTab === 'all' && !selectedCategory ? 'white' : colors.text,
                }}>
                  All ({allItems.length})
                </Text>
              </TouchableOpacity>

              {/* Category Buttons - Only show if count > 0 */}
              {CATEGORIES.map((category) => {
                const count = getCategoryCount(category.id);
                if (count === 0) return null; // Hide categories with no items
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => {
                      setActiveTab('all');
                      setSelectedCategory(category.id);
                    }}
                    style={{
                      marginHorizontal: 4,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      backgroundColor: selectedCategory === category.id ? category.color : colors.surface,
                      borderWidth: 1,
                      borderColor: selectedCategory === category.id ? category.color : colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
                      color={selectedCategory === category.id ? 'white' : category.color} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: selectedCategory === category.id ? 'white' : colors.text,
                    }}>
                      {category.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Uncategorized - Only show if count > 0 */}
              {getUncategorizedCount() > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setActiveTab('uncategorized');
                    setSelectedCategory(null);
                  }}
                  style={{
                    marginHorizontal: 4,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: activeTab === 'uncategorized' ? '#F59E0B' : colors.surface,
                    borderWidth: 1,
                    borderColor: activeTab === 'uncategorized' ? '#F59E0B' : colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons 
                    name="help-circle" 
                    size={16} 
                    color={activeTab === 'uncategorized' ? 'white' : '#F59E0B'} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: activeTab === 'uncategorized' ? 'white' : colors.text,
                  }}>
                    Uncategorized ({getUncategorizedCount()})
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} />
          }
        >
          {/* Items List */}
          <>
            {loading && filteredItems.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.textSecondary }}>
                  Loading items...
                </Text>
              </View>
            ) : filteredItems.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
                <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors.text }}>
                  No items found
                </Text>
                <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                  {searchQuery ? 'Try a different search term' : 
                   activeTab === 'uncategorized' ? 'All items are categorized!' :
                   'Add items using voice control or manually'}
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: getCategoryColor(item.category) + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Ionicons
                        name={getCategoryIcon(item.category) as any}
                        size={24}
                        color={getCategoryColor(item.category)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                        {item.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <View style={{
                          backgroundColor: '#10B981' + '20',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981' }}>
                            {item.quantity} {item.unit}
                          </Text>
                        </View>
                        {item.category && item.category !== 'other' ? (
                          <View style={{
                            backgroundColor: getCategoryColor(item.category) + '20',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 8,
                          }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: getCategoryColor(item.category) }}>
                              {item.category}
                            </Text>
                          </View>
                        ) : (
                          <View style={{
                            backgroundColor: '#F59E0B' + '20',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 8,
                          }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#F59E0B' }}>
                              Uncategorized
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleView(item)}
                      style={{
                        flex: 1,
                        backgroundColor: '#8B5CF6',
                        borderRadius: 8,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="eye" size={16} color="white" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                        View
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleEdit(item)}
                      disabled={updatingItem}
                      style={{
                        flex: 1,
                        backgroundColor: '#3B82F6',
                        borderRadius: 8,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: updatingItem ? 0.5 : 1,
                      }}
                    >
                      <Ionicons name="create" size={16} color="white" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      disabled={deletingItem}
                      style={{
                        flex: 1,
                        backgroundColor: '#EF4444',
                        borderRadius: 8,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: deletingItem ? 0.5 : 1,
                      }}
                    >
                      <Ionicons name="trash" size={16} color="white" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        </ScrollView>
      </View>

      {/* View Modal */}
      <Modal
        visible={showViewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}>
            {viewingItem && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: getCategoryColor(viewingItem.category) + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Ionicons
                      name={getCategoryIcon(viewingItem.category) as any}
                      size={40}
                      color={getCategoryColor(viewingItem.category)}
                    />
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>
                    {viewingItem.name}
                  </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}>
                    <Ionicons name="layers" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                    <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>Quantity</Text>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {viewingItem.quantity} {viewingItem.unit}
                    </Text>
                  </View>

                  {viewingItem.category && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}>
                      <Ionicons name="pricetag" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>Category</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {viewingItem.category}
                      </Text>
                    </View>
                  )}

                  {viewingItem.location && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}>
                      <Ionicons name="location" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>Location</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {viewingItem.location}
                      </Text>
                    </View>
                  )}

                  {viewingItem.createdAt && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                    }}>
                      <Ionicons name="calendar" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                      <Text style={{ fontSize: 14, color: colors.textSecondary, flex: 1 }}>Added</Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                        {new Date(viewingItem.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setShowViewModal(false)}
                  style={{
                    backgroundColor: '#3B82F6',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 24 }}>
              Edit Item
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Name
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={{
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Quantity
              </Text>
              <TextInput
                value={editQuantity}
                onChangeText={setEditQuantity}
                keyboardType="numeric"
                style={{
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Unit
              </Text>
              <TextInput
                value={editUnit}
                onChangeText={setEditUnit}
                style={{
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                style={{
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {editCategory && editCategory !== 'other' ? (
                    <>
                      <Ionicons 
                        name={getCategoryIcon(editCategory) as any} 
                        size={20} 
                        color={getCategoryColor(editCategory)} 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ fontSize: 16, color: colors.text }}>
                        {CATEGORIES.find(c => c.id === editCategory)?.label || 'Select Category'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="help-circle" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                        Uncategorized
                      </Text>
                    </>
                  )}
                </View>
                <Ionicons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={{
                  marginTop: 8,
                  backgroundColor: isDark ? '#374151' : '#F3F4F6',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  maxHeight: 200,
                }}>
                  <ScrollView>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => {
                          setEditCategory(cat.id);
                          setShowCategoryPicker(false);
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: cat.color + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}>
                          <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                        </View>
                        <Text style={{ fontSize: 15, color: colors.text, flex: 1 }}>
                          {cat.label}
                        </Text>
                        {editCategory === cat.id && (
                          <Ionicons name="checkmark" size={20} color={cat.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={updatingItem}
                style={{
                  flex: 1,
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: updatingItem ? 0.5 : 1,
                }}
              >
                {updatingItem ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
