import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLazyQuery } from '@apollo/client';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useInventory } from '@/hooks/useInventory';
import { CATEGORIZE_PRODUCT } from '@/lib/graphql/queries';
import { InventoryItem } from '@/types';

const categories = [
  { id: 'fruits', label: 'Fruits', icon: 'leaf', color: '#10B981' },
  { id: 'vegetables', label: 'Vegetables', icon: 'nutrition', color: '#059669' },
  { id: 'dairy', label: 'Dairy', icon: 'water', color: '#3B82F6' },
  { id: 'meat', label: 'Meat & Fish', icon: 'restaurant', color: '#EF4444' },
  { id: 'grains', label: 'Grains & Cereals', icon: 'ellipse', color: '#F59E0B' },
  { id: 'beverages', label: 'Beverages', icon: 'wine', color: '#8B5CF6' },
  { id: 'snacks', label: 'Snacks', icon: 'fast-food', color: '#F97316' },
  { id: 'condiments', label: 'Condiments', icon: 'flask', color: '#84CC16' },
  { id: 'frozen', label: 'Frozen', icon: 'snow', color: '#06B6D4' },
  { id: 'other', label: 'Other', icon: 'cube', color: '#6B7280' },
];

const units = [
  'pieces', 'kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'cans', 'bottles', 'boxes', 'bags'
];

export default function EditItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getItem, updateItem, loading } = useInventory();
  
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'pieces',
    expiryDate: null as Date | null,
    barcode: '',
    notes: '',
    image: null as string | null,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiCategorization, setAiCategorization] = useState<{
    category: string;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [categorizingProduct, setCategorizingProduct] = useState(false);
  const [originalName, setOriginalName] = useState('');

  // GraphQL query for AI categorization
  const [categorizeProduct] = useLazyQuery(CATEGORIZE_PRODUCT, {
    onCompleted: (data) => {
      if (data?.categorizeProduct) {
        const result = data.categorizeProduct;
        setAiCategorization(result);
        setCategorizingProduct(false);
      }
    },
    onError: (error) => {
      console.error('AI categorization error:', error);
      setCategorizingProduct(false);
      setAiCategorization({
        category: formData.category || 'other',
        confidence: 0.5,
        reasoning: 'AI categorization failed, keeping current category'
      });
    }
  });

  useEffect(() => {
    loadItem();
  }, [id]);

  // Auto-categorize when product name changes (but not on initial load)
  useEffect(() => {
    if (formData.name.trim().length > 2 && formData.name !== originalName) {
      setCategorizingProduct(true);
      categorizeProduct({
        variables: { productName: formData.name.trim() }
      });
    } else if (formData.name === originalName) {
      setAiCategorization(null);
    }
  }, [formData.name, originalName, categorizeProduct]);

  const loadItem = async () => {
    if (!id) return;
    try {
      const itemData = await getItem(id);
      if (itemData) {
        setItem(itemData);
        setOriginalName(itemData.name);
        setFormData({
          name: itemData.name,
          category: itemData.category || '',
          quantity: itemData.quantity?.toString() || '',
          unit: itemData.unit || 'pieces',
          expiryDate: itemData.expiryDate ? new Date(itemData.expiryDate) : null,
          barcode: itemData.barcode || '',
          notes: itemData.notes || '',
          image: itemData.image || null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !item) return;
    
    try {
      const result = await updateItem(item.id, {
        name: formData.name.trim(),
        category: formData.category,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiryDate: formData.expiryDate?.toISOString(),
        barcode: formData.barcode || undefined,
        notes: formData.notes || undefined,
        image: formData.image || undefined,
      });
      
      if (result.success) {
        Alert.alert('Success', 'Item updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to update item');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update item. Please try again.');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
            Loading item...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
          Edit Item
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.cardContainer}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
              {/* Item Photo */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  Item Photo (Optional)
                </Text>
                <View style={styles.photoRow}>
                  {formData.image ? (
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ uri: formData.image }} 
                        style={styles.itemImage}
                      />
                      <TouchableOpacity
                        onPress={() => setFormData(prev => ({ ...prev, image: null }))}
                        style={styles.removeImageButton}
                      >
                        <Ionicons name="close" size={12} color="white" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={takePhoto}
                        style={[styles.photoButton, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}
                      >
                        <Ionicons name="camera" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.photoButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          Camera
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={pickImage}
                        style={[styles.photoButton, { borderColor: isDark ? '#4B5563' : '#D1D5DB' }]}
                      >
                        <Ionicons name="images" size={24} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text style={[styles.photoButtonText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                          Gallery
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>

              {/* Item Name */}
              <View style={styles.section}>
                <Input
                  label="Product Name *"
                  placeholder="e.g., Organic Bananas"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  error={errors.name}
                  leftIcon="cube"
                />
                {categorizingProduct && (
                  <View style={styles.aiStatusContainer}>
                    <Ionicons name="sparkles" size={16} color="#3B82F6" />
                    <Text style={[styles.aiStatusText, { color: isDark ? '#93C5FD' : '#3B82F6' }]}>
                      AI is analyzing product...
                    </Text>
                  </View>
                )}
              </View>

              {/* AI Categorization Result - Show when name changes */}
              {aiCategorization && formData.name !== originalName && (
                <View style={[styles.aiResultContainer, { 
                  backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                  borderColor: isDark ? '#10B981' : '#059669',
                }]}>
                  <View style={styles.aiResultHeader}>
                    <Ionicons name="sparkles" size={20} color="#10B981" />
                    <Text style={[styles.aiResultTitle, { color: isDark ? '#10B981' : '#047857' }]}>
                      AI Category Suggestion
                    </Text>
                    <Badge 
                      text={`${Math.round(aiCategorization.confidence * 100)}%`}
                      color={aiCategorization.confidence > 0.8 ? '#10B981' : aiCategorization.confidence > 0.6 ? '#F59E0B' : '#EF4444'}
                    />
                  </View>
                  <Text style={[styles.aiResultText, { color: isDark ? '#D1FAE5' : '#065F46' }]}>
                    <Text style={{ fontWeight: '600' }}>
                      Suggested: {categories.find(cat => cat.id === aiCategorization.category)?.label || aiCategorization.category}
                    </Text>
                  </Text>
                  <Text style={[styles.aiReasoningText, { color: isDark ? '#A7F3D0' : '#047857' }]}>
                    {aiCategorization.reasoning}
                  </Text>
                  <View style={styles.aiActionButtons}>
                    <TouchableOpacity
                      onPress={() => setFormData(prev => ({ ...prev, category: aiCategorization.category }))}
                      style={[styles.acceptSuggestionButton, { 
                        backgroundColor: isDark ? '#10B981' : '#059669',
                        borderColor: 'transparent',
                      }]}
                    >
                      <Text style={[styles.acceptSuggestionText, { color: '#FFFFFF' }]}>
                        Use AI suggestion
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowCategoryModal(true)}
                      style={[styles.editCategoryButton, { 
                        borderColor: isDark ? '#10B981' : '#059669',
                      }]}
                    >
                      <Ionicons name="create-outline" size={16} color={isDark ? '#10B981' : '#059669'} />
                      <Text style={[styles.editCategoryText, { color: isDark ? '#10B981' : '#059669' }]}>
                        Choose manually
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Category Display */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  Category {formData.name === originalName ? '(Current)' : ''}
                </Text>
                <View style={[styles.categoryDisplay, { 
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderColor: selectedCategory ? selectedCategory.color : (isDark ? '#4B5563' : '#D1D5DB'),
                }]}>
                  <View style={styles.categoryDisplayContent}>
                    {selectedCategory ? (
                      <>
                        <Ionicons 
                          name={selectedCategory.icon as any} 
                          size={24} 
                          color={selectedCategory.color} 
                        />
                        <Text style={[styles.categoryDisplayText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                          {selectedCategory.label}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.categoryDisplayPlaceholder, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                        No category selected
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(true)}
                    style={styles.editCategoryIcon}
                  >
                    <Ionicons name="create-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quantity and Unit */}
              <View style={styles.quantityRow}>
                <View style={styles.quantityInput}>
                  <Input
                    label="Quantity *"
                    placeholder="0"
                    value={formData.quantity}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                    keyboardType="numeric"
                    error={errors.quantity}
                  />
                </View>
                
                <View style={styles.unitInput}>
                  <Text style={[styles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                    Unit
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowUnitModal(true)}
                    style={[styles.unitButton, { 
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#4B5563' : '#D1D5DB',
                    }]}
                  >
                    <Text style={[styles.unitButtonText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                      {formData.unit}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Expiry Date */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                  Expiry Date (Optional)
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.selectButton, { 
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#4B5563' : '#D1D5DB',
                  }]}
                >
                  <Text style={[styles.selectButtonText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {formData.expiryDate 
                      ? formData.expiryDate.toLocaleDateString()
                      : 'Select date'
                    }
                  </Text>
                  <Ionicons name="calendar" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </TouchableOpacity>
              </View>

              {/* Barcode */}
              <View style={styles.section}>
                <Input
                  label="Barcode (Optional)"
                  placeholder="Scan or enter barcode"
                  value={formData.barcode}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, barcode: text }))}
                  leftIcon="barcode"
                />
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Input
                  label="Notes (Optional)"
                  placeholder="Additional notes about this item"
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  multiline
                  numberOfLines={3}
                  leftIcon="document-text"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.submitContainer, { 
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
        }]}>
          <Button
            title="Update Item"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Category Modal */}
      <Modal
        isVisible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Select Category"
        size="lg"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  setFormData(prev => ({ ...prev, category: category.id }));
                  setShowCategoryModal(false);
                }}
                style={[styles.modalItem, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={24} 
                  color={category.color} 
                />
                <Text style={[styles.modalItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {category.label}
                </Text>
                {formData.category === category.id && (
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color="#3B82F6"
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Modal>

      {/* Unit Modal */}
      <Modal
        isVisible={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        title="Select Unit"
        size="md"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalContent}>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                onPress={() => {
                  setFormData(prev => ({ ...prev, unit }));
                  setShowUnitModal(false);
                }}
                style={[styles.modalItem, { backgroundColor: isDark ? '#374151' : '#F9FAFB' }]}
              >
                <Text style={[styles.modalItemText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  {unit}
                </Text>
                {formData.unit === unit && (
                  <Ionicons 
                    name="checkmark" 
                    size={20} 
                    color="#3B82F6"
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.expiryDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, expiryDate: selectedDate }));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButton: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectButtonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  selectButtonPlaceholder: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
  },
  unitButtonText: {
    fontSize: 16,
  },
  submitContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    width: '100%',
  },
  modalContent: {
    gap: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  modalItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    marginLeft: 'auto',
  },
  aiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  aiStatusText: {
    fontSize: 12,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  aiResultContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  aiResultText: {
    fontSize: 14,
    marginBottom: 4,
  },
  aiReasoningText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  acceptSuggestionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acceptSuggestionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editCategoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editCategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
  },
  categoryDisplayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDisplayText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  categoryDisplayPlaceholder: {
    fontSize: 16,
  },
  editCategoryIcon: {
    padding: 4,
  },
  aiActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  aiSelectedText: {
    fontSize: 12,
    fontWeight: '500',
  },
});