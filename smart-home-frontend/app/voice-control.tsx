import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

interface VoiceResult {
  intent: string;
  item: {
    raw_name: string | null;
    normalized_name: string | null;
    category: string | null;
    quantity: number | null;
    unit: string | null;
    location: string | null;
  };
  confidence: number;
}

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

export default function VoiceControlScreen() {
  const { colors, isDark } = useTheme();
  const [inputText, setInputText] = useState('');
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successItemName, setSuccessItemName] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [addingToInventory, setAddingToInventory] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Add item function without using useInventory hook
  const addItemToInventory = async (itemData: any) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      // Get or create kitchen
      const selectedHouseId = await AsyncStorage.getItem('selectedHouseId');
      const selectedHouseName = await AsyncStorage.getItem('selectedHouseName');
      
      if (!selectedHouseId || !selectedHouseName) {
        throw new Error('No house selected');
      }

      // Check if we have a cached kitchen ID for this house
      const cachedKitchenKey = `kitchen_${selectedHouseId}`;
      const cachedKitchenId = await AsyncStorage.getItem(cachedKitchenKey);
      
      let kitchenId = cachedKitchenId;

      if (!kitchenId) {
        // Get kitchen ID
        const kitchenResponse = await fetch(`${apiUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              query GetHouseholds {
                households {
                  id
                  name
                  kitchens {
                    id
                    name
                  }
                }
              }
            `,
          }),
        });

        const kitchenData = await kitchenResponse.json();
        const household = kitchenData.data?.households?.find((h: any) => h.name === selectedHouseName);
        kitchenId = household?.kitchens?.[0]?.id;

        // Create household and kitchen if needed
        if (!kitchenId) {
          let householdId = household?.id;
          
          if (!householdId) {
            const createHouseholdResponse = await fetch(`${apiUrl}/graphql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: `
                  mutation CreateHousehold($input: CreateHouseholdInput!) {
                    createHousehold(input: $input) {
                      id
                    }
                  }
                `,
                variables: {
                  input: {
                    name: selectedHouseName,
                    description: `Household for ${selectedHouseName}`,
                  },
                },
              }),
            });

            const householdResult = await createHouseholdResponse.json();
            householdId = householdResult.data?.createHousehold?.id;
          }

          if (householdId) {
            const createKitchenResponse = await fetch(`${apiUrl}/graphql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: `
                  mutation CreateKitchen($input: CreateKitchenInput!) {
                    createKitchen(input: $input) {
                      id
                    }
                  }
                `,
                variables: {
                  input: {
                    householdId: householdId,
                    name: `${selectedHouseName} Kitchen`,
                    description: `Main kitchen for ${selectedHouseName}`,
                    type: 'HOME',
                  },
                },
              }),
            });

            const kitchenResult = await createKitchenResponse.json();
            kitchenId = kitchenResult.data?.createKitchen?.id;
            
            // Cache the kitchen ID
            if (kitchenId) {
              await AsyncStorage.setItem(cachedKitchenKey, kitchenId);
            }
          }
        } else {
          // Cache the found kitchen ID
          await AsyncStorage.setItem(cachedKitchenKey, kitchenId);
        }
      }

      if (!kitchenId) {
        throw new Error('Failed to get or create kitchen');
      }

      // Create inventory item
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
              createInventoryItem(input: $input) {
                id
                name
                category
                defaultUnit
                totalQuantity
              }
            }
          `,
          variables: {
            input: {
              kitchenId: kitchenId,
              name: itemData.name,
              category: (itemData.category || 'OTHER').toUpperCase(),
              defaultUnit: itemData.unit || 'pieces',
              location: itemData.location ? itemData.location.toUpperCase() : 'PANTRY',
              threshold: 2,
              tags: [],
            },
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to add item');
      }

      // Add batch for quantity
      const itemId = data.data?.createInventoryItem?.id;
      if (itemId && itemData.quantity) {
        await fetch(`${apiUrl}/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              mutation CreateInventoryBatch($input: CreateInventoryBatchInput!) {
                createInventoryBatch(input: $input) {
                  id
                  quantity
                  unit
                }
              }
            `,
            variables: {
              input: {
                itemId: itemId,
                quantity: itemData.quantity,
                unit: itemData.unit || 'pieces',
                purchaseDate: new Date().toISOString(),
              },
            },
          }),
        });
      }

      return { success: true, data: data.data?.createInventoryItem };
    } catch (error: any) {
      console.error('Error adding item:', error);
      return { success: false, error: error.message };
    }
  };

  const {
    recordingState,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    error: recordingError,
  } = useVoiceRecording();

  // Update input text when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      // Auto-process the transcript
      processVoiceCommand(transcript);
    }
  }, [transcript]);

  // Show error if recording fails
  useEffect(() => {
    if (recordingError) {
      // Don't show alert for every error, just log it
      console.log('Recording error:', recordingError);
    }
  }, [recordingError]);

  const handleMicPress = async () => {
    if (recordingState === 'recording') {
      await stopRecording();
    } else if (recordingState === 'idle') {
      clearTranscript();
      setInputText('');
      setVoiceResult(null);
      await startRecording();
    }
  };

  const processVoiceCommand = async (text: string) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please speak or type a command');
      return;
    }

    try {
      setProcessingCommand(true);
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation ProcessVoiceCommand($transcript: String!) {
              processVoiceCommand(transcript: $transcript) {
                intent
                item {
                  raw_name
                  normalized_name
                  category
                  quantity
                  unit
                  location
                }
                confidence
                transcript
              }
            }
          `,
          variables: { transcript: text },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to process command');
      }

      if (data.data?.processVoiceCommand) {
        setVoiceResult(data.data.processVoiceCommand);
        setShowConfirmation(true);
      }
    } catch (error: any) {
      console.error('Error processing voice command:', error);
      Alert.alert('Error', error.message || 'Failed to process voice command');
    } finally {
      setProcessingCommand(false);
    }
  };

  const handleConfirm = async () => {
    if (!voiceResult) return;

    try {
      setAddingToInventory(true);
      
      // Use AI-detected category, or default to 'other' if null/empty
      const categoryToUse = voiceResult.item.category || 'other';
      
      const result = await addItemToInventory({
        name: voiceResult.item.normalized_name || voiceResult.item.raw_name || 'Unknown Item',
        quantity: voiceResult.item.quantity || 1,
        unit: voiceResult.item.unit || 'pieces',
        category: categoryToUse,
        location: voiceResult.item.location,
      });

      if (result.success) {
        setSuccessItemName(voiceResult.item.normalized_name || voiceResult.item.raw_name || 'Item');
        setShowConfirmation(false);
        setShowSuccessModal(true);
        
        // Animate success modal
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Reset after showing success
        setTimeout(() => {
          setVoiceResult(null);
          setInputText('');
          clearTranscript();
        }, 500);
      } else {
        Alert.alert('Error', result.error || 'Failed to add item to inventory');
      }
    } catch (error: any) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item to inventory');
    } finally {
      setAddingToInventory(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setVoiceResult(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    scaleAnim.setValue(0);
  };

  const handleViewInventory = () => {
    handleCloseSuccess();
    router.push('/(tabs)/inventory');
  };

  const handleAddAnother = () => {
    handleCloseSuccess();
    setInputText('');
    setVoiceResult(null);
    clearTranscript();
  };

  const getMicColor = () => {
    switch (recordingState) {
      case 'recording':
        return '#10B981'; // Green
      case 'processing':
        return '#F59E0B'; // Orange
      default:
        return '#8B5CF6'; // Purple
    }
  };

  const getMicIcon = () => {
    if (recordingState === 'recording') return 'stop-circle';
    if (recordingState === 'processing') return 'hourglass';
    return 'mic';
  };

  const isProcessing = recordingState === 'processing' || processingCommand;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Text style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 8,
            }}>
              Voice Control 🎤
            </Text>
            <Text style={{
              fontSize: 16,
              color: colors.textSecondary,
              marginBottom: 32,
            }}>
              Speak or type to add items to your inventory
            </Text>

            {/* Microphone Button */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <TouchableOpacity
                onPress={handleMicPress}
                disabled={isProcessing}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: getMicColor(),
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: getMicColor(),
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                  opacity: isProcessing ? 0.6 : 1,
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Ionicons name={getMicIcon()} size={48} color="white" />
                )}
              </TouchableOpacity>

              <Text style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: '600',
                color: getMicColor(),
              }}>
                {recordingState === 'recording' ? 'Listening...' :
                 recordingState === 'processing' ? 'Processing...' :
                 processingCommand ? 'Analyzing...' :
                 'Tap to speak'}
              </Text>

              {recordingState === 'recording' && (
                <Text style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: colors.textSecondary,
                }}>
                  Tap again to stop
                </Text>
              )}

              {/* Error Display */}
              {recordingError && recordingState === 'error' && (
                <View style={{
                  marginTop: 16,
                  backgroundColor: '#FEE2E2',
                  borderRadius: 12,
                  padding: 16,
                  maxWidth: 300,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#DC2626' }}>
                      Voice Recording Error
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#991B1B', marginBottom: 12 }}>
                    {recordingError}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      clearTranscript();
                      setInputText('');
                    }}
                    style={{
                      backgroundColor: '#DC2626',
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                      Try Again
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Manual Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
              }}>
                Or type your command:
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                borderRadius: 12,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}>
                <TextInput
                  ref={inputRef}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder='e.g., "Add 2 bottles of milk"'
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  editable={!isProcessing}
                />
                {inputText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setInputText('');
                      clearTranscript();
                    }}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Process Button */}
            <TouchableOpacity
              onPress={() => processVoiceCommand(inputText)}
              disabled={!inputText.trim() || isProcessing}
              style={{
                opacity: !inputText.trim() || isProcessing ? 0.5 : 1,
              }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={{
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="send" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: 'white',
                    }}>
                      Process Command
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Examples */}
            <View style={{ marginTop: 32 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}>
                Try saying:
              </Text>
              {[
                'Add 2 bottles of milk',
                'Add 5 tomatoes to the fridge',
                'Add 1 kg of chicken',
                'Add bread to pantry',
              ].map((example, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInputText(example)}
                  style={{
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="bulb-outline" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
                  <Text style={{
                    fontSize: 14,
                    color: colors.text,
                    fontStyle: 'italic',
                  }}>
                    "{example}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
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
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Confirm Item
            </Text>

            {voiceResult && (
              <View style={{ marginBottom: 24 }}>
                <View style={{
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="cube" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {voiceResult.item.normalized_name || voiceResult.item.raw_name}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="layers" size={20} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      Quantity: {voiceResult.item.quantity} {voiceResult.item.unit}
                    </Text>
                  </View>

                  {voiceResult.item.category ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="pricetag" size={20} color="#10B981" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                        Category: {voiceResult.item.category}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="pricetag" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                        Category: <Text style={{ color: '#F59E0B', fontWeight: '600' }}>null</Text>
                      </Text>
                    </View>
                  )}

                  {voiceResult.item.location && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={20} color="#3B82F6" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                        Location: {voiceResult.item.location}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{
                  backgroundColor: '#8B5CF6' + '20',
                  borderRadius: 12,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 12, color: colors.text }}>
                    Confidence: {Math.round(voiceResult.confidence * 100)}%
                  </Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleCancel}
                disabled={addingToInventory}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: addingToInventory ? 0.5 : 1,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={addingToInventory}
                style={{ flex: 1, opacity: addingToInventory ? 0.7 : 1 }}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  {addingToInventory ? (
                    <>
                      <ActivityIndicator color="white" size="small" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                        Adding...
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                      Add to Inventory
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccess}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}>
          <Animated.View style={{
            transform: [{ scale: scaleAnim }],
            width: '100%',
            maxWidth: 400,
          }}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={{
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
              }}
            >
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Ionicons name="checkmark" size={48} color="white" />
              </View>

              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Success!
              </Text>

              <Text style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 32,
                textAlign: 'center',
              }}>
                {successItemName} added to your inventory
              </Text>

              <View style={{ width: '100%', gap: 12 }}>
                <TouchableOpacity
                  onPress={handleViewInventory}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#10B981' }}>
                    View Inventory
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddAnother}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                    Add Another Item
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
