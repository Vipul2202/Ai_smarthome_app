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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<SearchResult | null>(null);
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
  const [processingMissingInfo, setProcessingMissingInfo] = useState(false);
  const [speechInProgress, setSpeechInProgress] = useState(false);
  const [autoRecordingTimeout, setAutoRecordingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState('');
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Helper function to safely start auto-recording with timeout management
  const scheduleAutoRecording = (delay: number = 2000) => {
    // Clear any existing timeout first
    if (autoRecordingTimeout) {
      clearTimeout(autoRecordingTimeout);
      setAutoRecordingTimeout(null);
    }
    
    // Only schedule if we're still in missing info flow and not currently speaking
    if (waitingForMissingInfo && !showConfirmation && !speechInProgress) {
      const timeout = setTimeout(async () => {
        if (recordingState !== 'recording' && waitingForMissingInfo && !showConfirmation && !speechInProgress) {
          await startRecording();
        }
        setAutoRecordingTimeout(null);
      }, delay);
      setAutoRecordingTimeout(timeout);
    }
  };

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
      // Prevent processing the same transcript multiple times
      if (transcript === lastProcessedTranscript) {
        console.log('🔄 Skipping duplicate transcript:', transcript);
        return;
      }
      
      if (waitingForMissingInfo) {
        // Don't process responses while AI is still speaking
        if (speechInProgress) {
          console.log('� Ignooring transcript while AI is speaking:', transcript);
          return;
        }
        
        // Don't process search-related transcripts as missing info responses
        if (transcript.toLowerCase().includes('search') || transcript.toLowerCase().includes('find')) {
          console.log('🔍 Ignoring search command in missing info flow:', transcript);
          return;
        }
        
        // Handle missing information response
        console.log('🔍 Debug - Processing missing info response:', {
          transcript,
          currentMissingInfo: missingInfoType[currentMissingInfoIndex],
          originalProductName: pendingVoiceResult?.item?.name
        });
        setLastProcessedTranscript(transcript);
        handleMissingInfoResponse(transcript);
      } else {
        setInputText(transcript);
        setLastProcessedTranscript(transcript);
        // Auto-process the transcript
        processVoiceCommand(transcript);
      }
    }
  }, [transcript, waitingForMissingInfo, speechInProgress, lastProcessedTranscript]);

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
      // Only clear previous state if we're not in missing info flow
      if (!waitingForMissingInfo) {
        clearTranscript();
        setInputText('');
        setVoiceResult(null);
        setWaitingForMissingInfo(false);
        setMissingInfoType([]);
        setCurrentMissingInfoIndex(0);
        setPendingVoiceResult(null);
        setIsGeneratingSpeech(false);
        setPlayingAudio(false);
        setLastProcessedTranscript(''); // Clear last processed transcript
        setCurrentIntent(null); // Clear current intent
      }
      
      await startRecording();
    }
  };

  const processVoiceCommand = async (text: string) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please speak or type a command');
      return;
    }

    // Prevent processing if already processing a command
    if (processingCommand) {
      console.log('🔄 Already processing a command, skipping:', text);
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
          extractedLocation: result.item.location,
          intent: result.intent
        });

        // Handle different intents
        if (result.intent === 'SEARCH') {
          // Handle search intent - completely bypass missing info flow
          console.log('🔍 Processing SEARCH intent, bypassing missing info flow');
          setCurrentIntent('SEARCH');
          
          // CRITICAL: Stop any ongoing missing info processes immediately
          setWaitingForMissingInfo(false);
          setMissingInfoType([]);
          setCurrentMissingInfoIndex(0);
          setPendingVoiceResult(null);
          setIsGeneratingSpeech(false);
          setPlayingAudio(false);
          setSpeechInProgress(false);
          setProcessingMissingInfo(false);
          
          // Clear any pending timeouts
          if (autoRecordingTimeout) {
            clearTimeout(autoRecordingTimeout);
            setAutoRecordingTimeout(null);
          }
          
          // Stop any ongoing recording
          if (recordingState === 'recording') {
            await stopRecording();
          }
          
          await handleSearchIntent(result.item.name);
          return;
        }
        
        if (result.intent === 'UPDATE') {
          // Handle update intent - search for item and show update modal
          console.log('🔄 Processing UPDATE intent for:', result.item.name);
          setCurrentIntent('UPDATE');
          
          // Stop any ongoing processes
          setWaitingForMissingInfo(false);
          setMissingInfoType([]);
          setCurrentMissingInfoIndex(0);
          setPendingVoiceResult(null);
          setIsGeneratingSpeech(false);
          setPlayingAudio(false);
          setSpeechInProgress(false);
          setProcessingMissingInfo(false);
          
          // Stop any ongoing recording
          if (recordingState === 'recording') {
            await stopRecording();
          }
          
          await handleUpdateIntent(result.item.name, result.item.quantity);
          return;
        }
        
        if (result.intent === 'DELETE') {
          // Handle delete intent - search for item and show delete confirmation
          console.log('🗑️ Processing DELETE intent for:', result.item.name);
          setCurrentIntent('DELETE');
          
          // Stop any ongoing processes
          setWaitingForMissingInfo(false);
          setMissingInfoType([]);
          setCurrentMissingInfoIndex(0);
          setPendingVoiceResult(null);
          setIsGeneratingSpeech(false);
          setPlayingAudio(false);
          setSpeechInProgress(false);
          setProcessingMissingInfo(false);
          
          // Stop any ongoing recording
          if (recordingState === 'recording') {
            await stopRecording();
          }
          
          await handleDeleteIntent(result.item.name);
          return;
        }
        
        // Set current intent for ADD operations
        setCurrentIntent('ADD');
        
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

        // Smart validation for required fields
        const actualMissingInfo = [];
        
        console.log('🔍 Debug - Checking required fields:', {
          name: voiceResultData.item.name,
          quantity: voiceResultData.item.quantity,
          category: voiceResultData.item.category,
          location: voiceResultData.item.location
        });
        
        // Always require quantity (but it should be extracted from initial command)
        if (!voiceResultData.item.quantity || voiceResultData.item.quantity <= 0) {
          actualMissingInfo.push('quantity');
          console.log('❌ Missing: quantity');
        }
        
        // Only require category if it's not automatically detectable
        if (!voiceResultData.item.category || voiceResultData.item.category === '') {
          // Try to auto-detect category based on product name
          const productName = voiceResultData.item.name.toLowerCase();
          let autoCategory = null;
          
          // Common food categories
          if (productName.includes('milk') || productName.includes('cheese') || productName.includes('yogurt') || productName.includes('butter')) {
            autoCategory = 'dairy';
          } else if (productName.includes('apple') || productName.includes('banana') || productName.includes('orange') || productName.includes('fruit')) {
            autoCategory = 'fruits';
          } else if (productName.includes('tomato') || productName.includes('onion') || productName.includes('potato') || productName.includes('vegetable')) {
            autoCategory = 'vegetables';
          } else if (productName.includes('chicken') || productName.includes('beef') || productName.includes('meat') || productName.includes('fish')) {
            autoCategory = 'meat';
          } else if (productName.includes('bread') || productName.includes('rice') || productName.includes('pasta') || productName.includes('cereal')) {
            autoCategory = 'grains';
          } else if (productName.includes('water') || productName.includes('juice') || productName.includes('soda') || productName.includes('coffee')) {
            autoCategory = 'beverages';
          } else if (productName.includes('chips') || productName.includes('cookies') || productName.includes('candy') || productName.includes('snack')) {
            autoCategory = 'snacks';
          }
          
          if (autoCategory) {
            voiceResultData.item.category = autoCategory;
            console.log('🤖 Auto-detected category:', autoCategory, 'for product:', productName);
          } else {
            actualMissingInfo.push('category');
            console.log('❌ Missing: category (could not auto-detect for:', productName, ')');
          }
        } else {
          console.log('✅ Category already provided:', voiceResultData.item.category);
        }
        
        // Only require location if not provided
        if (!voiceResultData.item.location || voiceResultData.item.location === '') {
          actualMissingInfo.push('location');
          console.log('❌ Missing: location');
        } else {
          console.log('✅ Location already provided:', voiceResultData.item.location);
        }
        
        console.log('🔍 Debug - Final missing info check:', {
          actualMissingInfo,
          willShowConfirmation: actualMissingInfo.length === 0
        });

        // Check for missing information
        if (actualMissingInfo.length > 0) {
          // Store the pending result and start missing info flow
          setPendingVoiceResult(voiceResultData);
          setMissingInfoType(actualMissingInfo);
          setCurrentMissingInfoIndex(0);
          setWaitingForMissingInfo(true); // SET THIS FIRST!
          
          console.log('🔍 Debug - Starting missing info flow:', {
            originalProductName: voiceResultData.item.name,
            missingFields: actualMissingInfo,
            missingInfoLength: actualMissingInfo.length,
            startingIndex: 0
          });
          
          // IMPORTANT: Set processingCommand to false before generating speech
          setProcessingCommand(false);
          
          // Generate and play speech for missing information
          console.log('🎤 Generating speech for missing info:', actualMissingInfo);
          console.log('🔍 Debug - About to call generateMissingInfoSpeech with:', {
            actualMissingInfo,
            waitingForMissingInfo: true, // This should now be true
            isGeneratingSpeech,
            playingAudio
          });
          await generateMissingInfoSpeech(actualMissingInfo);
          
          // Auto-continue recording without user clicking microphone - but only after speech finishes
          // The scheduleAutoRecording will be called after the speech generation completes
        } else {
          // All required fields are complete, show confirmation directly
          
          // IMPORTANT: Stop all background processes first
          setIsGeneratingSpeech(false);
          setPlayingAudio(false);
          setWaitingForMissingInfo(false);
          setMissingInfoType([]);
          setCurrentMissingInfoIndex(0);
          setPendingVoiceResult(null);
          
          setVoiceResult(voiceResultData);
          setShowConfirmation(true);
          
          console.log('🎉 Showing confirmation modal immediately - all info complete');
          
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
      // Only set processingCommand to false if we're not in missing info flow
      if (!waitingForMissingInfo) {
        setProcessingCommand(false);
      }
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
    // Clear any pending auto-recording timeout
    if (autoRecordingTimeout) {
      clearTimeout(autoRecordingTimeout);
      setAutoRecordingTimeout(null);
    }
    
    // Complete cleanup of all states
    setShowConfirmation(false);
    setVoiceResult(null);
    setInputText('');
    clearTranscript();
    setWaitingForMissingInfo(false);
    setMissingInfoType([]);
    setCurrentMissingInfoIndex(0);
    setPendingVoiceResult(null);
    setIsGeneratingSpeech(false);
    setPlayingAudio(false);
    setSpeechInProgress(false);
    setProcessingCommand(false);
    setProcessingMissingInfo(false);
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchQuery('');
    setLastProcessedTranscript('');
    setCurrentIntent(null);
    
    console.log('🧹 Complete cleanup - all voice control states reset');
  };

  // Handle search intent
  const handleSearchIntent = async (searchTerm: string) => {
    // Prevent multiple simultaneous searches
    if (processingCommand) {
      console.log('🔄 Already processing, skipping search for:', searchTerm);
      return;
    }

    try {
      console.log('🔍 Processing search intent for:', searchTerm);
      
      // CRITICAL: Ensure we're completely out of missing info mode
      setWaitingForMissingInfo(false);
      setMissingInfoType([]);
      setCurrentMissingInfoIndex(0);
      setPendingVoiceResult(null);
      setProcessingMissingInfo(false);
      
      // Stop any ongoing audio immediately
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
      setSpeechInProgress(false);
      
      setProcessingCommand(true);
      setSearchQuery(searchTerm);
      
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

      // Search for items
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query SearchInventoryByVoice($kitchenId: ID!, $searchTerm: String!) {
              searchInventoryByVoice(kitchenId: $kitchenId, searchTerm: $searchTerm) {
                id
                name
                category
                totalQuantity
                defaultUnit
                location
                similarity
              }
            }
          `,
          variables: { kitchenId, searchTerm },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to search items');
      }

      const results = data.data?.searchInventoryByVoice || [];
      console.log('🔍 Search results:', results);
      
      setSearchResults(results);
      setShowSearchResults(true);
      
      // Stop any ongoing audio before generating search results speech
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
      setSpeechInProgress(false);
      
      // Generate speech for search results (only after showing modal)
      setTimeout(async () => {
        if (results.length === 0) {
          await generateSearchResultsSpeech(`No items found for "${searchTerm}".`);
        } else if (results.length === 1) {
          await generateSearchResultsSpeech(`Found 1 item. Check your screen.`);
        } else {
          await generateSearchResultsSpeech(`Found ${results.length} items. Check your screen.`);
        }
      }, 1000); // Longer delay to ensure modal is fully shown first

    } catch (error: any) {
      console.error('Error searching items:', error);
      Alert.alert('Search Error', error.message || 'Failed to search items');
    } finally {
      setProcessingCommand(false);
    }
  };

  // Generate speech for search results
  const generateSearchResultsSpeech = async (message: string) => {
    try {
      console.log('🎤 Generating search results speech:', message);
      
      // Ensure no other speech is playing
      setIsGeneratingSpeech(true);
      setPlayingAudio(true);
      setSpeechInProgress(true);
      
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      // Use the new simple speech mutation that doesn't add "some information missing" prefix
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation GenerateSimpleSpeech($text: String!) {
              generateSimpleSpeech(text: $text) {
                success
                speechData
              }
            }
          `,
          variables: { text: message },
        }),
      });

      const data = await response.json();
      const result = data.data?.generateSimpleSpeech;
      
      if (result?.success && result.speechData) {
        await playAudioFromBase64(result.speechData);
        console.log('✅ Search results speech completed');
      }
    } catch (error) {
      console.error('Error generating search results speech:', error);
    } finally {
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
      setSpeechInProgress(false);
    }
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

  // Handle UPDATE intent
  const handleUpdateIntent = async (itemName: string, quantity?: number) => {
    try {
      console.log('🔄 Processing UPDATE intent for:', itemName, 'quantity:', quantity);
      
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

      // Search for the item first
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query SearchInventoryByVoice($kitchenId: ID!, $searchTerm: String!) {
              searchInventoryByVoice(kitchenId: $kitchenId, searchTerm: $searchTerm) {
                id
                name
                category
                totalQuantity
                defaultUnit
                location
                similarity
              }
            }
          `,
          variables: { kitchenId, searchTerm: itemName },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to search items');
      }

      const results = data.data?.searchInventoryByVoice || [];
      
      if (results.length === 0) {
        Alert.alert('Item Not Found', `"${itemName}" was not found in your inventory.`);
        return;
      }

      // Use the best match (first result)
      const bestMatch = results[0];
      setSelectedUpdateItem(bestMatch);
      
      // If quantity was provided in voice command, use it
      if (quantity && quantity > 0) {
        setUpdateQuantity(quantity.toString());
      } else {
        setUpdateQuantity('');
      }
      
      setShowUpdateConfirm(true);

    } catch (error: any) {
      console.error('Error handling update intent:', error);
      Alert.alert('Update Error', error.message || 'Failed to process update command');
    }
  };

  // Handle DELETE intent
  const handleDeleteIntent = async (itemName: string) => {
    try {
      console.log('🗑️ Processing DELETE intent for:', itemName);
      
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

      // Search for the item first
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query SearchInventoryByVoice($kitchenId: ID!, $searchTerm: String!) {
              searchInventoryByVoice(kitchenId: $kitchenId, searchTerm: $searchTerm) {
                id
                name
                category
                totalQuantity
                defaultUnit
                location
                similarity
              }
            }
          `,
          variables: { kitchenId, searchTerm: itemName },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to search items');
      }

      const results = data.data?.searchInventoryByVoice || [];
      
      if (results.length === 0) {
        Alert.alert('Item Not Found', `"${itemName}" was not found in your inventory.`);
        return;
      }

      // Use the best match (first result)
      const bestMatch = results[0];
      setSelectedDeleteItem(bestMatch);
      setShowDeleteConfirm(true);

    } catch (error: any) {
      console.error('Error handling delete intent:', error);
      Alert.alert('Delete Error', error.message || 'Failed to process delete command');
    }
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

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteItem) return;

    try {
      setAddingToInventory(true);
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
            mutation DeleteInventoryItem($id: ID!) {
              deleteInventoryItem(id: $id)
            }
          `,
          variables: {
            id: selectedDeleteItem.id,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to delete item');
      }

      if (data.data?.deleteInventoryItem) {
        setSuccessMessage(`${selectedDeleteItem.name} has been deleted from your inventory`);
        setShowDeleteConfirm(false);
        setShowSuccessModal(true);
        
        // Animate success modal
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Reset state
        setSelectedDeleteItem(null);
        setVoiceResult(null);
        setInputText('');
        clearTranscript();
      } else {
        Alert.alert('Error', 'Failed to delete item');
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', error.message || 'Failed to delete item');
    } finally {
      setAddingToInventory(false);
    }
  };

  // Generate and play text-to-speech for missing information
  const generateMissingInfoSpeech = async (missingInfo: string[]) => {
    console.log('🎤 generateMissingInfoSpeech called with:', missingInfo);
    console.log('🔍 Debug - Speech generation state check:', {
      currentIntent,
      showSearchResults,
      waitingForMissingInfo,
      isGeneratingSpeech,
      playingAudio
    });
    
    // Don't generate speech if current intent is SEARCH
    if (currentIntent === 'SEARCH') {
      console.log('🔄 Skipping missing info speech - current intent is SEARCH');
      return;
    }
    
    // Don't generate speech if we're showing search results
    if (showSearchResults) {
      console.log('🔄 Skipping missing info speech - search results are showing');
      return;
    }
    
    // REMOVED: Don't check waitingForMissingInfo here since it's set asynchronously
    // The fact that this function is called means we need missing info speech
    
    // Prevent multiple speech generations
    if (isGeneratingSpeech || playingAudio) {
      console.log('🔄 Speech already generating or playing, skipping...');
      return;
    }

    console.log('🎤 Starting speech generation for missing info:', missingInfo);

    try {
      setIsGeneratingSpeech(true);
      setPlayingAudio(true);
      setSpeechInProgress(true);
      
      // Clear any existing auto-recording timeouts first
      if (autoRecordingTimeout) {
        clearTimeout(autoRecordingTimeout);
        setAutoRecordingTimeout(null);
        console.log('🚫 Cleared existing auto-recording timeout before speech');
      }
      
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
        console.error('🚨 GraphQL errors:', data.errors);
        throw new Error(data.errors[0]?.message || 'Failed to generate speech');
      }

      const result = data.data?.generateMissingInfoSpeech;
      
      if (result?.success && result.speechData) {
        console.log('✅ Speech data received, playing audio...');
        setMissingInfoAudio(result.speechData);
        
        // Play the audio and wait for it to finish
        await playAudioFromBase64(result.speechData);
        
        console.log('🎤 Speech audio finished playing');
        
        // Only auto-start recording if we're still in missing info flow
        if (waitingForMissingInfo && !showConfirmation) {
          console.log('🎤 Speech finished, scheduling auto-recording in 1 second');
          scheduleAutoRecording(1000);
        } else {
          console.log('🚫 Not scheduling auto-recording - not in missing info flow');
        }
      } else {
        console.log('❌ No speech data received or generation failed');
      }
    } catch (error: any) {
      console.error('Error generating speech:', error);
      // Don't show error to user, just continue without audio
    } finally {
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
      setSpeechInProgress(false);
    }
  };

  // Play audio from base64 data
  const playAudioFromBase64 = async (base64Data: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Data}` },
        { shouldPlay: true }
      );
      
      // Wait for the audio to finish playing
      return new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Handle missing information response from user
  const handleMissingInfoResponse = async (response: string) => {
    if (!pendingVoiceResult || !missingInfoType.length) {
      console.log('⚠️ No pending voice result or missing info type, skipping response processing');
      return;
    }

    // Prevent double processing of the same response
    if (processingMissingInfo) {
      console.log('🔄 Already processing missing info response, skipping duplicate');
      return;
    }

    setProcessingMissingInfo(true);
    console.log('🔄 Starting to process missing info response:', response);

    // Filter out AI responses and system messages
    const responseStr = response.toLowerCase().trim();
    
    // Skip if this looks like the original command being repeated
    const originalCommand = pendingVoiceResult.item.name ? `add ${pendingVoiceResult.item.name}` : '';
    if (responseStr.includes('add') && pendingVoiceResult.item.name && responseStr.includes(pendingVoiceResult.item.name.toLowerCase())) {
      console.log('🔄 Skipping repeated original command:', response);
      setProcessingMissingInfo(false);
      // Continue recording for actual user response
      scheduleAutoRecording(1000);
      return;
    }
    
    // Skip if this looks like an AI response or system message
    const aiResponsePatterns = [
      'some information is missing',
      'please tell me the',
      'what category would you like',
      'which location would you prefer',
      'i need to know',
      'could you tell me',
      'add chicken',
      'add milk',
      'add bread',
      'add rice'
    ];
    
    const isAIResponse = aiResponsePatterns.some(pattern => responseStr.includes(pattern));
    if (isAIResponse) {
      console.log('🤖 Skipping AI response or repeated command:', response);
      setProcessingMissingInfo(false);
      // Continue recording for actual user response
      scheduleAutoRecording(1000);
      return;
    }

    // Check if this is a simple, direct response (like "fridge", "dairy", etc.)
    const isSimpleResponse = responseStr.length <= 15 && 
                            !responseStr.includes('add') && 
                            !responseStr.includes('chicken') && 
                            !responseStr.includes('milk') &&
                            !responseStr.includes('some information') &&
                            !responseStr.includes('missing');
    
    // If it's not a simple response and contains the original product name, skip it
    if (!isSimpleResponse && pendingVoiceResult.item.name && responseStr.includes(pendingVoiceResult.item.name.toLowerCase())) {
      console.log('🔄 Skipping complex response containing original product name:', response);
      setProcessingMissingInfo(false);
      scheduleAutoRecording(1000);
      return;
    }
    
    if (isSimpleResponse) {
      console.log('✅ Detected simple response, processing directly:', response);
    }

    const currentMissingInfo = missingInfoType[currentMissingInfoIndex];
    const updatedResult = { ...pendingVoiceResult };

    console.log('🔍 Debug - Processing user response:', {
      productName: updatedResult.item.name,
      currentMissingInfo,
      userResponse: response,
      isSimpleResponse,
      responseLength: responseStr.length
    });

    // Parse the response based on missing info type
    if (currentMissingInfo === 'location') {
      console.log('🔍 Processing location response:', responseStr);
      
      // Don't use responses that contain the original command or product name
      if (responseStr.includes('add') || (pendingVoiceResult.item.name && responseStr.includes(pendingVoiceResult.item.name.toLowerCase()))) {
        console.log('❌ Invalid location response - contains original command or product name');
        setProcessingMissingInfo(false);
        scheduleAutoRecording(1000);
        return;
      }
      
      // First try to extract clean location
      const cleanLocation = extractCleanLocation(response);
      if (cleanLocation) {
        console.log('✅ Clean location extracted:', cleanLocation);
        updatedResult.item.location = cleanLocation;
      } else {
        // Common location keywords (more comprehensive)
        const locationWords = ['fridge', 'freezer', 'pantry', 'cabinet', 'cupboard', 'kitchen', 'shelf', 'container', 'storage'];
        const foundLocation = locationWords.find(loc => responseStr.includes(loc));
        if (foundLocation) {
          console.log('✅ Location keyword found:', foundLocation);
          updatedResult.item.location = foundLocation;
        } else {
          // For very short responses, use them directly if they seem reasonable
          if (responseStr.length <= 10 && responseStr.length >= 3 && !responseStr.includes('what') && !responseStr.includes('where')) {
            console.log('✅ Using short response as location:', responseStr);
            updatedResult.item.location = responseStr;
          } else {
            // Use first meaningful word as location
            const words = responseStr.split(' ').filter(word => 
              word.length > 2 && 
              !['add', 'two', 'bottles', 'milk', 'the', 'in', 'to', 'at'].includes(word)
            );
            if (words.length > 0) {
              console.log('✅ Using first meaningful word as location:', words[0]);
              updatedResult.item.location = words[0];
            } else {
              // If we can't extract anything meaningful, ask again
              console.log('❌ Could not extract location from:', response);
              setProcessingMissingInfo(false);
              scheduleAutoRecording(1000);
              return;
            }
          }
        }
      }
    } else if (currentMissingInfo === 'category') {
      console.log('🔍 Processing category response:', responseStr);
      
      // Don't use responses that contain the original command or product name
      if (responseStr.includes('add') || (pendingVoiceResult.item.name && responseStr.includes(pendingVoiceResult.item.name.toLowerCase()))) {
        console.log('❌ Invalid category response - contains original command or product name');
        setProcessingMissingInfo(false);
        scheduleAutoRecording(1000);
        return;
      }
      
      // Extract clean category from response
      const cleanCategory = extractCleanCategory(response);
      if (cleanCategory) {
        console.log('✅ Clean category extracted:', cleanCategory);
        updatedResult.item.category = cleanCategory;
      } else {
        // Map common category words
        const categoryMap = {
          'dairy': 'dairy',
          'fruit': 'fruits',
          'fruits': 'fruits',
          'vegetable': 'vegetables',
          'vegetables': 'vegetables',
          'meat': 'meat',
          'grain': 'grains',
          'grains': 'grains',
          'beverage': 'beverages',
          'beverages': 'beverages',
          'drink': 'beverages',
          'snack': 'snacks',
          'snacks': 'snacks',
          'food': 'other',
          'grocery': 'other'
        };
        
        const foundCategory = Object.keys(categoryMap).find(cat => responseStr.includes(cat));
        if (foundCategory) {
          console.log('✅ Category keyword found:', foundCategory);
          updatedResult.item.category = categoryMap[foundCategory as keyof typeof categoryMap];
        } else {
          // For very short responses, try to use them directly
          if (responseStr.length <= 15 && responseStr.length >= 3) {
            console.log('✅ Using short response as category:', responseStr);
            updatedResult.item.category = responseStr;
          } else {
            console.log('⚠️ Using default category: other');
            updatedResult.item.category = 'other';
          }
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

    console.log('🔍 Debug - Missing info flow check:', {
      currentMissingInfoIndex,
      missingInfoTypeLength: missingInfoType.length,
      missingInfoType,
      shouldContinue: currentMissingInfoIndex < missingInfoType.length - 1
    });

    // Move to next missing info or complete the flow
    if (currentMissingInfoIndex < missingInfoType.length - 1) {
      // Ask for next missing information
      setCurrentMissingInfoIndex(currentMissingInfoIndex + 1);
      setPendingVoiceResult(updatedResult);
      
      const nextMissingInfo = missingInfoType[currentMissingInfoIndex + 1];
      console.log('🎤 Generating speech for next missing info:', [nextMissingInfo]);
      await generateMissingInfoSpeech([nextMissingInfo]);
      
      // Auto-recording will be scheduled after speech finishes in generateMissingInfoSpeech
    } else {
      // All missing info collected, show confirmation
      console.log('✅ All missing info collected, showing confirmation modal');
      
      // Clear any pending auto-recording timeout
      if (autoRecordingTimeout) {
        clearTimeout(autoRecordingTimeout);
        setAutoRecordingTimeout(null);
      }
      
      // IMPORTANT: Stop all background processes first
      setWaitingForMissingInfo(false);
      setMissingInfoType([]);
      setCurrentMissingInfoIndex(0);
      setPendingVoiceResult(null);
      setIsGeneratingSpeech(false);
      setPlayingAudio(false);
      
      // Stop recording when showing confirmation
      if (recordingState === 'recording') {
        await stopRecording();
      }
      
      // Clear any pending timeouts or audio
      clearTranscript();
      
      // Set final result and show confirmation
      setVoiceResult(updatedResult);
      setShowConfirmation(true);
      
      console.log('🎉 Confirmation modal should now be visible with all info complete');
    }
    
    // Reset processing flag
    setProcessingMissingInfo(false);
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
                 speechInProgress ? 'AI is speaking...' :
                 playingAudio ? 'AI is asking... (mic will auto-start)' :
                 waitingForMissingInfo ? 
                   `Ready to hear your ${missingInfoType[currentMissingInfoIndex]}` :
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
                'Search for chicken',
                'Update milk quantity to 5',
                'Delete old bread',
                'Find tomatoes',
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
                  <Ionicons 
                    name={
                      example.includes('Add') ? 'add-circle-outline' :
                      example.includes('Search') || example.includes('Find') ? 'search-outline' :
                      example.includes('Update') ? 'create-outline' :
                      example.includes('Delete') ? 'trash-outline' :
                      'bulb-outline'
                    } 
                    size={20} 
                    color={
                      example.includes('Add') ? '#10B981' :
                      example.includes('Search') || example.includes('Find') ? '#8B5CF6' :
                      example.includes('Update') ? '#F59E0B' :
                      example.includes('Delete') ? '#EF4444' :
                      '#8B5CF6'
                    } 
                    style={{ marginRight: 12 }} 
                  />
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
        onRequestClose={() => {
          // Complete cleanup when modal is closed
          setShowSearchResults(false);
          setSearchResults([]);
          setSearchQuery('');
          setIsGeneratingSpeech(false);
          setPlayingAudio(false);
          setSpeechInProgress(false);
          setLastProcessedTranscript('');
          setCurrentIntent(null);
          clearTranscript(); // Clear transcript to prevent reprocessing
        }}
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
              marginBottom: 8,
              textAlign: 'center',
            }}>
              Search Results
            </Text>
            
            {searchQuery && (
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 16,
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                Searching for: "{searchQuery}"
              </Text>
            )}

            <ScrollView style={{ maxHeight: 300 }}>
              {searchResults.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Text style={{ 
                    textAlign: 'center', 
                    color: colors.textSecondary, 
                    fontSize: 16,
                    marginBottom: 16 
                  }}>
                    No items found for "{searchQuery}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowSearchResults(false);
                      setInputText(`Add ${searchQuery}`);
                    }}
                    style={{
                      backgroundColor: '#10B981',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                      Add "{searchQuery}" to Inventory
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                searchResults.map((item, index) => (
                  <View key={index} style={{
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: item.similarity > 0.8 ? '#10B981' : 'transparent',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#8B5CF6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ fontSize: 16 }}>📦</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                          {item.name}
                        </Text>
                        <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                          {item.totalQuantity} {item.defaultUnit} • {item.category}
                        </Text>
                        {/* Show match type indicator */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                          <View style={{
                            backgroundColor: item.similarity > 0.8 ? '#10B981' : 
                                           item.similarity > 0.6 ? '#F59E0B' : '#8B5CF6',
                            borderRadius: 8,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            marginRight: 6,
                          }}>
                            <Text style={{ fontSize: 10, color: 'white', fontWeight: '600' }}>
                              {item.similarity > 0.8 ? 'Name Match' :
                               item.similarity > 0.6 ? 'Category Match' :
                               item.similarity > 0.4 ? 'Location Match' : 'Fuzzy Match'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={{
                        backgroundColor: item.similarity > 0.8 ? '#10B981' : '#8B5CF6',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}>
                        <Text style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                          {Math.round(item.similarity * 100)}%
                        </Text>
                      </View>
                    </View>
                    <View style={{
                      backgroundColor: isDark ? '#374151' : '#E5E7EB',
                      borderRadius: 8,
                      padding: 8,
                    }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        📍 Location: {item.location}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  // Complete cleanup when closing search results
                  setShowSearchResults(false);
                  setSearchResults([]);
                  setSearchQuery('');
                  setIsGeneratingSpeech(false);
                  setPlayingAudio(false);
                  setSpeechInProgress(false);
                  setLastProcessedTranscript('');
                  setCurrentIntent(null);
                  clearTranscript(); // Clear transcript to prevent reprocessing
                }}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  Close
                </Text>
              </TouchableOpacity>
              
              {searchResults.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    // Clean up search state and start new recording
                    setShowSearchResults(false);
                    setSearchResults([]);
                    setSearchQuery('');
                    setIsGeneratingSpeech(false);
                    setPlayingAudio(false);
                    setSpeechInProgress(false);
                    setLastProcessedTranscript('');
                    setCurrentIntent(null);
                    clearTranscript(); // Clear transcript to prevent reprocessing
                    
                    // Auto-start recording for next command
                    setTimeout(async () => {
                      await startRecording();
                    }, 500);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#8B5CF6',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                    Search Again
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#F59E0B',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons name="create" size={28} color="white" />
              </View>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
                textAlign: 'center',
              }}>
                Update Quantity
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                Modify the quantity for this item
              </Text>
            </View>

            {selectedUpdateItem && (
              <View style={{ marginBottom: 24 }}>
                {/* Item Display */}
                <View style={{
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 2,
                  borderColor: '#F59E0B',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#F59E0B',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      <Text style={{ fontSize: 20 }}>📦</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 20, 
                        fontWeight: 'bold', 
                        color: colors.text,
                        marginBottom: 4,
                      }}>
                        {selectedUpdateItem.name}
                      </Text>
                      <Text style={{ 
                        fontSize: 14, 
                        color: colors.textSecondary,
                        textTransform: 'capitalize',
                      }}>
                        {selectedUpdateItem.category} • {selectedUpdateItem.location}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Current Quantity Display */}
                  <View style={{
                    backgroundColor: isDark ? '#374151' : '#E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View>
                      <Text style={{ 
                        fontSize: 12, 
                        color: colors.textSecondary, 
                        fontWeight: '600',
                        marginBottom: 4,
                      }}>
                        CURRENT QUANTITY
                      </Text>
                      <Text style={{ 
                        fontSize: 18, 
                        color: colors.text, 
                        fontWeight: 'bold',
                      }}>
                        {selectedUpdateItem.totalQuantity} {selectedUpdateItem.defaultUnit}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                  </View>
                </View>

                {/* New Quantity Input */}
                <View>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '700', 
                    color: colors.text, 
                    marginBottom: 12,
                    textAlign: 'center',
                  }}>
                    Enter New Quantity
                  </Text>
                  <View style={{
                    backgroundColor: isDark ? '#374151' : '#F9FAFB',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: updateQuantity ? '#F59E0B' : (isDark ? '#4B5563' : '#D1D5DB'),
                    overflow: 'hidden',
                  }}>
                    <TextInput
                      value={updateQuantity}
                      onChangeText={setUpdateQuantity}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 16,
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: colors.text,
                        textAlign: 'center',
                      }}
                      autoFocus
                    />
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginTop: 8,
                  }}>
                    Unit: {selectedUpdateItem.defaultUnit}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowUpdateConfirm(false)}
                disabled={addingToInventory}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? '#374151' : '#E5E7EB',
                  borderRadius: 16,
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
                    borderRadius: 16,
                    paddingVertical: 16,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    shadowColor: '#F59E0B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
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
                    <>
                      <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                        Update
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
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
              Delete Item
            </Text>

            {selectedDeleteItem && (
              <View style={{ marginBottom: 24 }}>
                <View style={{
                  backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: '#EF4444',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#EF4444',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Ionicons name="trash" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
                        {selectedDeleteItem.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                        {selectedDeleteItem.totalQuantity} {selectedDeleteItem.defaultUnit} • {selectedDeleteItem.category}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    📍 Location: {selectedDeleteItem.location}
                  </Text>
                </View>

                <View style={{
                  backgroundColor: '#FEE2E2',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#FECACA',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="warning" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#DC2626' }}>
                      Warning
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: '#991B1B' }}>
                    This action cannot be undone. The item and all its batches will be permanently deleted from your inventory.
                  </Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
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
                onPress={handleDeleteConfirm}
                disabled={addingToInventory}
                style={{ 
                  flex: 1, 
                  opacity: addingToInventory ? 0.5 : 1 
                }}
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
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
                        Deleting...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="trash" size={16} color="white" style={{ marginRight: 8 }} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
                        Delete
                      </Text>
                    </>
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
