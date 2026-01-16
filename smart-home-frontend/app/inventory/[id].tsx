import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/types';

const categories = {
  fruits: { label: 'Fruits', icon: 'leaf', color: '#10B981' },
  vegetables: { label: 'Vegetables', icon: 'nutrition', color: '#059669' },
  dairy: { label: 'Dairy', icon: 'water', color: '#3B82F6' },
  meat: { label: 'Meat & Fish', icon: 'restaurant', color: '#EF4444' },
  grains: { label: 'Grains & Cereals', icon: 'ellipse', color: '#F59E0B' },
  beverages: { label: 'Beverages', icon: 'wine', color: '#8B5CF6' },
  snacks: { label: 'Snacks', icon: 'fast-food', color: '#F97316' },
  condiments: { label: 'Condiments', icon: 'flask', color: '#84CC16' },
  frozen: { label: 'Frozen', icon: 'snow', color: '#06B6D4' },
  other: { label: 'Other', icon: 'cube', color: '#6B7280' },
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItem, updateItem, deleteItem, loading } = useInventory();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    try {
      const itemData = await getItem(id);
      setItem(itemData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteItem(item.id);
      Alert.alert('Success', 'Item deleted successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!item || !newQuantity) return;
    try {
      await updateItem(item.id, { quantity: parseFloat(newQuantity) });
      setItem(prev => prev ? { ...prev, quantity: parseFloat(newQuantity) } : null);
      setShowQuantityModal(false);
      setNewQuantity('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleShare = async () => {
    if (!item) return;
    try {
      await Share.share({
        message: `${item.name} - ${item.quantity} ${item.unit}${item.expiryDate ? ` (Expires: ${new Date(item.expiryDate).toLocaleDateString()})` : ''}`,
        title: 'Inventory Item'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', text: 'Expired', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 3) return { status: 'critical', text: 'Expires Soon', days: daysUntilExpiry };
    if (daysUntilExpiry <= 7) return { status: 'warning', text: 'Expires This Week', days: daysUntilExpiry };
    return { status: 'good', text: 'Fresh', days: daysUntilExpiry };
  };

  if (loading || !item) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner text="Loading item details..." className="flex-1" />
      </SafeAreaView>
    );
  }

  const category = categories[item.category as keyof typeof categories] || categories.other;
  const expiryInfo = getExpiryStatus(item.expiryDate);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} className="text-gray-900 dark:text-white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Item Details</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} className="text-gray-900 dark:text-white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/inventory/edit/${item.id}`)}>
            <Ionicons name="create-outline" size={24} className="text-gray-900 dark:text-white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Item Image and Basic Info */}
        <Card className="mb-6">
          <View className="items-center">
            {item.image ? (
              <Image 
                source={{ uri: item.image }} 
                className="w-32 h-32 rounded-lg mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-32 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center mb-4">
                <Ionicons 
                  name={category.icon as any} 
                  size={48} 
                  color={category.color} 
                />
              </View>
            )}
            
            <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              {item.name}
            </Text>
            
            <View className="flex-row items-center space-x-2 mb-4">
              <Badge variant="secondary">
                <Ionicons name={category.icon as any} size={16} color={category.color} />
                <Text className="ml-1">{category.label}</Text>
              </Badge>
              
              {expiryInfo && (
                <StatusBadge status={expiryInfo.status as any} text={expiryInfo.text} />
              )}
            </View>
          </View>
        </Card>

        {/* Quantity Card */}
        <Card className="mb-6">
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Quantity
            </Text>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-blue-500">
                  {item.quantity}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400">
                  {item.unit}
                </Text>
              </View>
              
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => {
                    setNewQuantity(item.quantity.toString());
                    setShowQuantityModal(true);
                  }}
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Update</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {item.quantity <= 5 && (
              <View className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={16} className="text-yellow-600 dark:text-yellow-400" />
                  <Text className="ml-2 text-yellow-700 dark:text-yellow-300 text-sm">
                    Low stock - Consider restocking soon
                  </Text>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Expiry Information */}
        {item.expiryDate && (
          <Card className="mb-6">
            <CardHeader>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Expiry Information
              </Text>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Expiry Date</Text>
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
                
                {expiryInfo && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">Status</Text>
                    <StatusBadge status={expiryInfo.status as any} text={expiryInfo.text} />
                  </View>
                )}
                
                {expiryInfo && expiryInfo.status !== 'expired' && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">Days Remaining</Text>
                    <Text className="text-gray-900 dark:text-white font-medium">
                      {expiryInfo.days} {expiryInfo.days === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card className="mb-6">
          <CardHeader>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Additional Information
            </Text>
          </CardHeader>
          <CardContent>
            <View className="space-y-3">
              {item.barcode && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 dark:text-gray-400">Barcode</Text>
                  <Text className="text-gray-900 dark:text-white font-mono">
                    {item.barcode}
                  </Text>
                </View>
              )}
              
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Added</Text>
                <Text className="text-gray-900 dark:text-white">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Last Updated</Text>
                <Text className="text-gray-900 dark:text-white">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              
              {item.notes && (
                <View>
                  <Text className="text-gray-600 dark:text-gray-400 mb-2">Notes</Text>
                  <Text className="text-gray-900 dark:text-white">
                    {item.notes}
                  </Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent>
            <View className="space-y-3">
              <Button
                title="Find Recipes"
                onPress={() => router.push(`/recipes?ingredient=${encodeURIComponent(item.name)}`)}
                variant="outline"
                leftIcon="restaurant-outline"
              />
              
              <Button
                title="Delete Item"
                onPress={() => setShowDeleteModal(true)}
                variant="destructive"
                leftIcon="trash-outline"
              />
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Update Quantity Modal */}
      <Modal
        isVisible={showQuantityModal}
        onClose={() => setShowQuantityModal(false)}
        title="Update Quantity"
        size="sm"
      >
        <View className="space-y-4">
          <Input
            label="New Quantity"
            value={newQuantity}
            onChangeText={setNewQuantity}
            keyboardType="numeric"
            placeholder="Enter quantity"
          />
          
          <View className="flex-row space-x-3 justify-end">
            <Button
              title="Cancel"
              onPress={() => setShowQuantityModal(false)}
              variant="outline"
            />
            <Button
              title="Update"
              onPress={handleUpdateQuantity}
              loading={loading}
            />
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </SafeAreaView>
  );
}