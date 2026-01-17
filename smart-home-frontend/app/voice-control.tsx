import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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
import { useLocalVoiceRecording } from '@/hooks/useLocalVoiceRecording';
import { Audio } from 'expo-av';

interface VoiceResult {
  intent: 'ADD' | 'UPDATE' | 'SEARCH' | 'DELETE' | 'UNKNOWN';
  item: {
    name: string;
    quantity?: number;
    unit?: string;
    category?: string;
    location?: string;
  };
  confidence: number;
  missingInfo?: string[];
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  defaultUnit: string;
  location: string;
  similarity: number;
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [addingToInventory, setAddingToInventory] = useState(false);
  const [selectedUpdateItem, setSelectedUpdateItem] = useState<SearchResult | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);
  const [missingInfoAudio, setMissingInfoAudio] = useState<string | null>(null);
  const [waitingForMissingInfo, setWaitingForMissingInfo] = useState(false);
  const [missingInfoType, setMissingInfoType] = useState<string[]>([]);
  const [currentMissingInfoIndex, setCurrentMissingInfoIndex] = useState(0);
  const [pendingVoiceResult, setPendingVoiceResult] = useState<VoiceResult | null>(null);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Helper function to extract clean location from response
  const extractCleanLocation = (response: string): string | null => {
    const responseStr = response.toLowerCase().trim();
    
    // Common location keywords
    const locationKeywords = ['fridge', 'freezer', 'pantry', 'cabinet', 'cupboard', 'container', 'shelf', 'kitchen', 'storage'];
    
    // Find the first location keyword in the response
    for (const keyword of locationKeywords) {
      if (responseStr.includes(keyword)) {
        return keyword;
      }
    }
    
    // If no keyword found, check if it's a reasonable response (not a question)
    const words = responseStr.split(' ');
    if (words.length <= 2 && words[0].length > 2 && !responseStr.includes('what') && !responseStr.includes('where')) {
      return responseStr;
    }
    
    return null;
  };

  // Helper function to extract clean category from response
  const extractCleanCategory = (response: string): string | null => {
    const responseStr = response.toLowerCase().trim();
    
    // Common category keywords
    const categoryKeywords = [
      'fruits', 'fruit', 'vegetables', 'vegetable', 'dairy', 'meat', 'grains', 'grain',
      'beverages', 'beverage', 'drinks', 'drink', 'snacks', 'snack', 'other', 'food',
      'frozen', 'fresh', 'canned', 'packaged', 'seafood', 'fish', 'poultry', 'bread',
      'bakery', 'condiments', 'spices', 'herbs'
    ];
    
    // Find the first category keyword in the response
    for (const keyword of categoryKeywords) {
      if (responseStr.includes(keyword)) {
        return keyword;
      }
    }
    
    // If no keyword found, check if it's a reasonable response (not a question)
    const words = responseStr.split(' ');
    if (words.length <= 2 && words[0].length > 2 && !responseStr.includes('what') && !responseStr.includes('which')) {
      return responseStr;
    }
    
    return null;
  };

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
  } = useLocalVoiceRecording();

  // Update input text when transcript changes
  useEffect(() => {
    if (transcript) {
      if (waitingForMissingInfo) {
        // Handle missing information response
        console.log('🔍 Debug - Processing missing info response:', {
          transcript,
          currentMissingInfo: missingInfoType[currentMissingInfoIndex],
          originalProductName: pendingVoiceResult?.item?.name
        });
        handleMissingInfoResponse(transcript);
      } else {
        setInputText(transcript);
        // Auto-process the transcript
        processVoiceCommand(transcript);
      }
    }
  }, [transcript, waitingForMissingInfo]);

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
      // Clear previous state
      clearTranscript();
      setInputText('');
      setVoiceResult(null);
      setWaitingForMissingInfo(false);
      setMissingInfoType([]);
      setCurrentMissingInfoIndex(0);
      setPendingVoiceResult(null);
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
      
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

      // Process voice intent with new AI service
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation ProcessVoiceIntent($transcript: String!) {
              processVoiceIntent(transcript: $transcript) {
                intent
                item {
                  name
                  quantity
                  unit
                  category
                  location
                }
                confidence
                missingInfo
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

      if (data.data?.processVoiceIntent) {
        const result = data.data.processVoiceIntent;
        
        console.log('🔍 Debug - Initial voice processing:', {
          originalTranscript: text,
          extractedName: result.item.name,
          extractedCategory: result.item.category,
          extractedLocation: result.item.location
        });
        
        const voiceResultData = {
          intent: result.intent,
          item: {
            name: result.item.name || '',
            quantity: result.item.quantity || 1,
            unit: result.item.unit || 'pieces', // Default unit
            category: result.item.category,
            location: result.item.location,
          },
          confidence: result.confidence,
          missingInfo: result.missingInfo || [],
        };

        // Validate required fields before showing confirmation
        const requiredFields = ['quantity', 'category', 'location'];
        const actualMissingInfo = requiredFields.filter(field => {
          const value = voiceResultData.item[field as keyof typeof voiceResultData.item];
          
          // Check if value is missing or empty
          if (!value || value === '' || value === null || value === undefined) {
            return true;
          }
          
          // More lenient validation - only reject obvious AI responses
          const valueStr = String(value).toLowerCase();
          const obviousAIPatterns = [
            'what category would you like',
            'which location would you prefer', 
            'how many would you like',
            'please specify the',
            'could you tell me the',
            'i need to know the'
          ];
          
          // Only reject if it's clearly an AI question
          const hasObviousAIPattern = obviousAIPatterns.some(pattern => valueStr.includes(pattern));
          if (hasObviousAIPattern) {
            return true;
          }
          
          return false;
        });

        // Check for missing information
        if (actualMissingInfo.length > 0) {
          // Store the pending result and start missing info flow
          setPendingVoiceResult(voiceResultData);
          setMissingInfoType(actualMissingInfo);
          setCurrentMissingInfoIndex(0);
          setWaitingForMissingInfo(true);
          
          console.log('🔍 Debug - Starting missing info flow:', {
            originalProductName: voiceResultData.item.name,
            missingFields: actualMissingInfo
          });
          
          // Generate and play speech for missing information (only once)
          if (!isGeneratingSpeech && !playingAudio) {
            await generateMissingInfoSpeech(actualMissingInfo);
          }
          
          // Auto-continue recording without user clicking microphone
          setTimeout(async () => {
            if (recordingState !== 'recording') {
              await startRecording();
            }
          }, 2000); // Wait 2 seconds after speech finishes, then auto-start recording
        } else {
          // All required fields are complete, show confirmation directly
          setVoiceResult(voiceResultData);
          setShowConfirmation(true);
          
          // Stop any ongoing recording when showing confirmation
          if (recordingState === 'recording') {
            await stopRecording();
          }
          
          // Clear any pending voice states
          setWaitingForMissingInfo(false);
          setMissingInfoType([]);
          setCurrentMissingInfoIndex(0);
          setPendingVoiceResult(null);
        }
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
      
      // Use user's location directly, or default to 'PANTRY'
      let locationToUse = 'PANTRY'; // default
      if (voiceResult.item.location) {
        // Try to map to valid StorageLocation enum, but accept user's input
        const location = voiceResult.item.location.toUpperCase();
        const validLocations = ['PANTRY', 'FRIDGE', 'FREEZER', 'CONTAINER', 'CABINET'];
        if (validLocations.includes(location)) {
          locationToUse = location;
        } else {
          // For custom locations, try to map to closest valid enum
          if (location.includes('FRIDGE') || location.includes('REFRIGERATOR')) {
            locationToUse = 'FRIDGE';
          } else if (location.includes('FREEZER')) {
            locationToUse = 'FREEZER';
          } else if (location.includes('CABINET') || location.includes('CUPBOARD')) {
            locationToUse = 'CABINET';
          } else if (location.includes('CONTAINER') || location.includes('BOX')) {
            locationToUse = 'CONTAINER';
          } else {
            // For completely custom locations, use CONTAINER as generic
            locationToUse = 'CONTAINER';
          }
        }
      }
      
      const result = await addItemToInventory({
        name: voiceResult.item.name || 'Unknown Item',
        quantity: voiceResult.item.quantity || 1,
        unit: voiceResult.item.unit || 'pieces',
        category: categoryToUse,
        location: locationToUse,
      });

      if (result.success) {
        setSuccessMessage(`${voiceResult.item.name} added to your inventory`);
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
    setInputText('');
    clearTranscript();
    setWaitingForMissingInfo(false);
    setMissingInfoType([]);
    setCurrentMissingInfoIndex(0);
    setPendingVoiceResult(null);
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

  const handleUpdateConfirm = async () => {
    if (!selectedUpdateItem || !updateQuantity) return;

    try {
      setAddingToInventory(true);
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';
      const selectedHouseId = await AsyncStorage.getItem('selectedHouseId');
      
      if (!selectedHouseId) {
        throw new Error('No house selected');
      }

      // Get cached kitchen ID
      const cachedKitchenKey = `kitchen_${selectedHouseId}`;
      const kitchenId = await AsyncStorage.getItem(cachedKitchenKey);
      
      if (!kitchenId) {
        throw new Error('Kitchen not found');
      }

      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateInventoryByVoice($kitchenId: ID!, $itemName: String!, $quantity: Float!) {
              updateInventoryByVoice(kitchenId: $kitchenId, itemName: $itemName, quantity: $quantity) {
                success
                message
                item {
                  id
                  name
                  totalQuantity
                  defaultUnit
                }
              }
            }
          `,
          variables: {
            kitchenId,
            itemName: selectedUpdateItem.name,
            quantity: parseFloat(updateQuantity),
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to update item');
      }

      const result = data.data?.updateInventoryByVoice;
      if (result?.success) {
        setSuccessMessage(result.message);
        setShowUpdateConfirm(false);
        setShowSuccessModal(true);
        
        // Animate success modal
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Reset state
        setSelectedUpdateItem(null);
        setUpdateQuantity('');
        setVoiceResult(null);
        setInputText('');
        clearTranscript();
      } else {
        Alert.alert('Error', result?.message || 'Failed to update item');
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      Alert.alert('Error', error.message || 'Failed to update item');
    } finally {
      setAddingToInventory(false);
    }
  };

  // Generate and play text-to-speech for missing information
  const generateMissingInfoSpeech = async (missingInfo: string[]) => {
    // Prevent multiple speech generations
    if (isGeneratingSpeech || playingAudio) {
      console.log('🔄 Speech already generating or playing, skipping...');
      return;
    }

    try {
      setIsGeneratingSpeech(true);
      setPlayingAudio(true);
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
            mutation GenerateMissingInfoSpeech($missingInfo: [String!]!) {
              generateMissingInfoSpeech(missingInfo: $missingInfo) {
                success
                speechData
              }
            }
          `,
          variables: { missingInfo },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to generate speech');
      }

      const result = data.data?.generateMissingInfoSpeech;
      if (result?.success && result.speechData) {
        setMissingInfoAudio(result.speechData);
        // Play the audio
        await playAudioFromBase64(result.speechData);
      }
    } catch (error: any) {
      console.error('Error generating speech:', error);
      // Don't show error to user, just continue without audio
    } finally {
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
    }
  };

  // Play audio from base64 data
  const playAudioFromBase64 = async (base64Data: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Data}` },
        { shouldPlay: true }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Handle missing information response from user
  const handleMissingInfoResponse = async (response: string) => {
    if (!pendingVoiceResult || !missingInfoType.length) return;

    const currentMissingInfo = missingInfoType[currentMissingInfoIndex];
    const updatedResult = { ...pendingVoiceResult };

    console.log('🔍 Debug - Before update:', {
      productName: updatedResult.item.name,
      currentMissingInfo,
      userResponse: response
    });

    // Parse the response based on missing info type
    if (currentMissingInfo === 'location') {
      // Extract clean location from response
      const cleanLocation = extractCleanLocation(response);
      if (cleanLocation) {
        updatedResult.item.location = cleanLocation;
      } else {
        // If we can't extract a clean location, use the response as-is but clean it
        const cleanResponse = response.trim().toLowerCase();
        if (cleanResponse.length > 0 && !cleanResponse.includes('what') && !cleanResponse.includes('where')) {
          updatedResult.item.location = cleanResponse;
        }
      }
    } else if (currentMissingInfo === 'category') {
      // Extract clean category from response
      const cleanCategory = extractCleanCategory(response);
      if (cleanCategory) {
        updatedResult.item.category = cleanCategory;
      } else {
        // If we can't extract a clean category, use the response as-is but clean it
        const cleanResponse = response.trim().toLowerCase();
        if (cleanResponse.length > 0 && !cleanResponse.includes('what') && !cleanResponse.includes('which')) {
          updatedResult.item.category = cleanResponse;
        }
      }
    } else if (currentMissingInfo === 'quantity') {
      // Extract number from response
      const numbers = response.match(/\d+/);
      if (numbers) {
        updatedResult.item.quantity = parseInt(numbers[0]);
      } else {
        updatedResult.item.quantity = 1; // default
      }
      // Also try to extract unit if mentioned
      const unitWords = response.toLowerCase().split(' ');
      const commonUnits = ['pieces', 'kg', 'grams', 'liters', 'bottles', 'cans', 'boxes', 'packets'];
      const foundUnit = unitWords.find(word => commonUnits.includes(word));
      if (foundUnit && !updatedResult.item.unit) {
        updatedResult.item.unit = foundUnit;
      }
    } else if (currentMissingInfo === 'unit') {
      // Accept whatever user says as unit
      updatedResult.item.unit = response.trim();
    }

    // IMPORTANT: Ensure product name is never overwritten
    if (!updatedResult.item.name && pendingVoiceResult.item.name) {
      updatedResult.item.name = pendingVoiceResult.item.name;
    }

    console.log('🔍 Debug - After update:', {
      productName: updatedResult.item.name,
      category: updatedResult.item.category,
      location: updatedResult.item.location,
      quantity: updatedResult.item.quantity
    });

    // Move to next missing info or complete the flow
    if (currentMissingInfoIndex < missingInfoType.length - 1) {
      // Ask for next missing information
      setCurrentMissingInfoIndex(currentMissingInfoIndex + 1);
      setPendingVoiceResult(updatedResult);
      
      const nextMissingInfo = missingInfoType[currentMissingInfoIndex + 1];
      // Only generate speech if not already generating
      if (!isGeneratingSpeech && !playingAudio) {
        await generateMissingInfoSpeech([nextMissingInfo]);
      }
      
      // Auto-continue recording after speech finishes
      setTimeout(async () => {
        if (recordingState !== 'recording') {
          await startRecording();
        }
      }, 2000); // Wait 2 seconds after speech, then auto-start recording
    } else {
      // All missing info collected, validate once more before showing confirmation
      const requiredFields = ['quantity', 'category', 'location'];
      const stillMissing = requiredFields.filter(field => {
        const value = updatedResult.item[field as keyof typeof updatedResult.item];
        
        // Check if value is missing or empty
        if (!value || value === '' || value === null || value === undefined) {
          return true;
        }
        
        // More lenient validation - only reject obvious AI responses
        const valueStr = String(value).toLowerCase();
        const obviousAIPatterns = [
          'what category would you like',
          'which location would you prefer',
          'how many would you like',
          'please specify the',
          'could you tell me the',
          'i need to know the'
        ];
        
        // Only reject if it's clearly an AI question
        const hasObviousAIPattern = obviousAIPatterns.some(pattern => valueStr.includes(pattern));
        if (hasObviousAIPattern) {
          return true;
        }
        
        return false;
      });

      if (stillMissing.length > 0) {
        // Still missing some info, continue the flow
        setMissingInfoType(stillMissing);
        setCurrentMissingInfoIndex(0);
        setPendingVoiceResult(updatedResult);
        
        if (!isGeneratingSpeech && !playingAudio) {
          await generateMissingInfoSpeech(stillMissing);
        }
        
        setTimeout(async () => {
          if (recordingState !== 'recording') {
            await startRecording();
          }
        }, 2000);
      } else {
        // All required info collected, show confirmation
        setWaitingForMissingInfo(false);
        setMissingInfoType([]);
        setCurrentMissingInfoIndex(0);
        setPendingVoiceResult(null);
        
        // Stop recording when showing confirmation
        if (recordingState === 'recording') {
          await stopRecording();
        }
        
        // Set final result and show confirmation
        setVoiceResult(updatedResult);
        setShowConfirmation(true);
      }
    }
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
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }}
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
                disabled={isProcessing || showConfirmation}
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
                  opacity: (isProcessing || showConfirmation) ? 0.6 : 1,
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
                {showConfirmation ? 'Review your item details' :
                 recordingState === 'recording' ? 
                  (waitingForMissingInfo ? 
                    `Tell me the ${missingInfoType[currentMissingInfoIndex]}` : 
                    'Listening...') :
                 recordingState === 'processing' ? 'Processing...' :
                 processingCommand ? 'Analyzing...' :
                 playingAudio ? 'AI is asking...' :
                 waitingForMissingInfo ? 
                   `Please tell me the ${missingInfoType[currentMissingInfoIndex]}` :
                 'Tap to speak'}
              </Text>

              {waitingForMissingInfo && missingInfoType.length > 0 && !showConfirmation && (
                <View style={{
                  marginTop: 12,
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 12,
                  maxWidth: 300,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: colors.text,
                    textAlign: 'center',
                    marginBottom: 8,
                  }}>
                    Missing Information ({currentMissingInfoIndex + 1}/{missingInfoType.length})
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    {missingInfoType.map((info, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: index === currentMissingInfoIndex ? '#8B5CF6' : 
                                         index < currentMissingInfoIndex ? '#10B981' : '#E5E7EB',
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          color: index === currentMissingInfoIndex || index < currentMissingInfoIndex ? 'white' : '#6B7280',
                          fontWeight: '600',
                        }}>
                          {info}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

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
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => {
                        clearTranscript();
                        setInputText('');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#DC2626',
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                        Try Again
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        clearTranscript();
                        setInputText('');
                        inputRef.current?.focus();
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: '#6B7280',
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: 'white' }}>
                        Use Text
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                {/* Item Name with Icon */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <View style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#8B5CF6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                  </View>
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold', 
                    color: colors.text,
                    flex: 1,
                  }}>
                    {voiceResult.item.name || 'Unknown Item'}
                  </Text>
                </View>
                
                {/* Item Details */}
                <View style={{ gap: 12 }}>
                  {/* Quantity */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                  }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#10B981',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 16 }}>📊</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                        Quantity
                      </Text>
                      <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
                        {voiceResult.item.quantity} {voiceResult.item.unit || 'pieces'}
                      </Text>
                    </View>
                  </View>

                  {/* Category */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                  }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#10B981',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 16 }}>🏷️</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                        Category
                      </Text>
                      <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
                        {voiceResult.item.category || 'other'}
                      </Text>
                    </View>
                  </View>

                  {/* Location */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                  }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#10B981',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 16 }}>📍</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                        Location
                      </Text>
                      <Text style={{ fontSize: 16, color: colors.text, fontWeight: '600' }}>
                        {voiceResult.item.location || 'pantry'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Confidence Indicator */}
                <View style={{
                  backgroundColor: '#EDE9FE',
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '600' }}>
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
                {successMessage}
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

      {/* Search Results Modal */}
      <Modal
        visible={showSearchResults}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchResults(false)}
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
            maxHeight: '80%',
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Search Results
            </Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {searchResults.length === 0 ? (
                <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: 20 }}>
                  No items found
                </Text>
              ) : (
                searchResults.map((item, index) => (
                  <View key={index} style={{
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      {item.totalQuantity} {item.defaultUnit} • {item.category} • {item.location}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#8B5CF6' }}>
                      Match: {Math.round(item.similarity * 100)}%
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowSearchResults(false)}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Update Confirmation Modal */}
      <Modal
        visible={showUpdateConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdateConfirm(false)}
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
              Update Quantity
            </Text>

            {selectedUpdateItem && (
              <View style={{ marginBottom: 24 }}>
                <View style={{
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                    {selectedUpdateItem.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    Current: {selectedUpdateItem.totalQuantity} {selectedUpdateItem.defaultUnit}
                  </Text>
                </View>

                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  New Quantity:
                </Text>
                <TextInput
                  value={updateQuantity}
                  onChangeText={setUpdateQuantity}
                  keyboardType="numeric"
                  placeholder="Enter new quantity"
                  placeholderTextColor={colors.textSecondary}
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
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowUpdateConfirm(false)}
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
                onPress={handleUpdateConfirm}
                disabled={addingToInventory || !updateQuantity}
                style={{ 
                  flex: 1, 
                  opacity: (addingToInventory || !updateQuantity) ? 0.5 : 1 
                }}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
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
                        Updating...
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                      Update
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
