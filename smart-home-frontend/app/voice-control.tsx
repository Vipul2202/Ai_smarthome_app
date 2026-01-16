import React, { useState, useRef } from 'react';
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
import * as Speech from 'expo-speech';
import { useInventory } from '@/hooks/useInventory';

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

type MicState = 'idle' | 'listening' | 'processing';

export default function VoiceControlScreen() {
  const { colors, isDark } = useTheme();
  const { addItem } = useInventory();
  const [micState, setMicState] = useState<MicState>('idle');
  const [inputText, setInputText] = useState('');
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successItemName, setSuccessItemName] = useState('');
  const inputRef = useRef<TextInput>(null);
  const successScaleAnim = useRef(new Animated.Value(0)).current;

  // Get mic color based on state
  const getMicColor = () => {
    switch (micState) {
      case 'listening':
        return ['#10B981', '#059669']; // Green
      case 'processing':
        return ['#F59E0B', '#D97706']; // Orange
      default:
        return ['#8B5CF6', '#7C3AED']; // Purple
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (micState) {
      case 'listening':
        return '🎤 Listening... Speak now!';
      case 'processing':
        return '⚙️ Processing with AI...';
      default:
        return 'Ready to capture';
    }
  };

  // Start voice capture - focus on text input so user can use voice-to-text
  const startVoiceCapture = () => {
    setMicState('listening');
    Speech.speak('Listening... Please speak your command', {
      language: 'en',
      pitch: 1,
      rate: 1,
    });
    
    // Focus on text input - user can use keyboard's voice-to-text
    inputRef.current?.focus();
    
    // Show instruction
    Alert.alert(
      '🎤 Voice Input',
      'Tap the microphone icon on your keyboard to speak, or type manually.',
      [{ text: 'OK' }]
    );
  };

  // Process the command (from voice or text)
  const processCommand = async () => {
    if (!inputText.trim()) {
      Alert.alert('Empty Input', 'Please speak or type a command first.');
      return;
    }

    const text = inputText.trim();
    setMicState('processing');

    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        Alert.alert('Authentication Required', 'Please login to use voice control.');
        setMicState('idle');
        return;
      }

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      console.log('🎤 Sending to backend:', text);

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
      console.log('📊 Response:', JSON.stringify(data, null, 2));

      if (data.data?.processVoiceCommand) {
        const result = data.data.processVoiceCommand;
        setVoiceResult(result);
        setShowConfirmation(true);
        setMicState('idle');

        const itemName = result.item.normalized_name || result.item.raw_name || 'item';
        Speech.speak(`I understood: ${result.intent.replace('_', ' ')} ${itemName}`, {
          language: 'en',
          pitch: 1,
          rate: 1,
        });
      } else if (data.errors) {
        console.error('❌ Errors:', data.errors);
        Alert.alert('Error', data.errors[0]?.message || 'Failed to process command');
        setMicState('idle');
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error?.message || 'Failed to process. Please try again.');
      setMicState('idle');
    }
  };

  // Clear input
  const clearInput = () => {
    setInputText('');
    setVoiceResult(null);
    setShowConfirmation(false);
    setMicState('idle');
  };

  // Confirm and add to inventory
  const confirmAndAddToInventory = async () => {
    if (!voiceResult) return;

    // Prevent multiple submissions
    if (micState === 'processing') return;

    try {
      setMicState('processing');
      
      if (voiceResult.intent === 'add_item') {
        const result = await addItem({
          name: voiceResult.item.normalized_name || voiceResult.item.raw_name || '',
          category: voiceResult.item.category || 'other',
          quantity: voiceResult.item.quantity || 1,
          unit: voiceResult.item.unit || 'pieces',
          notes: `Added via voice: "${inputText}"`,
        });

        if (result.success) {
          Speech.speak('Item added successfully', { language: 'en' });
          
          // Show colorful success modal
          setSuccessItemName(voiceResult.item.normalized_name || voiceResult.item.raw_name || 'Item');
          setShowSuccessModal(true);
          
          // Animate success modal
          Animated.spring(successScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
          }).start();
          
          // Clear input after showing modal
          clearInput();
        } else {
          Alert.alert('Error', 'Failed to add item to inventory');
          setMicState('idle');
        }
      } else {
        Alert.alert(
          'Coming Soon',
          `The "${voiceResult.intent.replace('_', ' ')}" feature will be available soon!`,
          [
            {
              text: 'OK',
              onPress: () => {
                clearInput();
                setMicState('idle');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to confirm:', error);
      Alert.alert('Error', 'Failed to complete action');
      setMicState('idle');
    }
  };

  const handleCloseSuccessModal = () => {
    Animated.timing(successScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessModal(false);
      successScaleAnim.setValue(0);
    });
  };

  const cancelAction = () => {
    clearInput();
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'add_item':
        return '#10B981';
      case 'update_item':
        return '#3B82F6';
      case 'remove_item':
        return '#EF4444';
      case 'query_item':
        return '#8B5CF6';
      default:
        return colors.textSecondary;
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'add_item':
        return 'add-circle';
      case 'update_item':
        return 'create';
      case 'remove_item':
        return 'trash';
      case 'query_item':
        return 'search';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Voice Control</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Microphone Button */}
          <View style={styles.micContainer}>
            <TouchableOpacity
              style={[
                styles.micButton,
                micState === 'listening' && styles.micButtonListening,
              ]}
              onPress={startVoiceCapture}
              disabled={micState === 'processing'}
            >
              <LinearGradient
                colors={getMicColor()}
                style={styles.micGradient}
              >
                {micState === 'processing' ? (
                  <ActivityIndicator size="large" color="white" />
                ) : (
                  <Ionicons
                    name={micState === 'listening' ? 'mic' : 'mic-outline'}
                    size={64}
                    color="white"
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Status */}
            <Text style={[styles.micStatus, { color: colors.text }]}>
              {getStatusText()}
            </Text>

            {/* State Indicator */}
            <View style={styles.stateIndicator}>
              <View style={[
                styles.stateDot,
                {
                  backgroundColor:
                    micState === 'listening' ? '#10B981' :
                    micState === 'processing' ? '#F59E0B' :
                    '#8B5CF6'
                }
              ]} />
              <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                {micState === 'listening' ? 'Capturing...' :
                 micState === 'processing' ? 'Processing...' :
                 'Ready'}
              </Text>
            </View>
          </View>

          {/* Text Input Field - Type OR Voice-to-Text */}
          <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              💬 Speak or Type Your Command:
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.textInput, { 
                  color: colors.text,
                  backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
                  borderColor: colors.border,
                }]}
                placeholder='e.g., "Add 2 bottles of milk to pantry"'
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              
              {inputText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearInput}
                >
                  <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              💡 Tap microphone icon on keyboard to speak, or type manually
            </Text>

            {/* Process Button */}
            <TouchableOpacity
              style={[styles.processButton]}
              onPress={processCommand}
              disabled={micState === 'processing' || !inputText.trim()}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.processGradient}
              >
                <Ionicons name="arrow-forward-circle" size={24} color="white" />
                <Text style={styles.processButtonText}>
                  {micState === 'processing' ? 'Processing...' : 'Process Command'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* JSON Confirmation */}
          {showConfirmation && voiceResult && (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: '#8B5CF6' }]}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={getIntentIcon(voiceResult.intent)}
                  size={32}
                  color={getIntentColor(voiceResult.intent)}
                />
                <Text style={[styles.cardTitle, { color: colors.text, marginLeft: 12 }]}>
                  {voiceResult.intent.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              {/* Beautiful Data Display */}
              <View style={styles.resultDetails}>
                {voiceResult.item.normalized_name && (
                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="cube" size={18} color="#8B5CF6" />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary, marginLeft: 8 }]}>
                        Item Name
                      </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {voiceResult.item.normalized_name}
                    </Text>
                  </View>
                )}

                {voiceResult.item.quantity && (
                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calculator" size={18} color="#10B981" />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary, marginLeft: 8 }]}>
                        Quantity
                      </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {voiceResult.item.quantity} {voiceResult.item.unit || ''}
                    </Text>
                  </View>
                )}

                {voiceResult.item.category && (
                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="pricetag" size={18} color="#F59E0B" />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary, marginLeft: 8 }]}>
                        Category
                      </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text, textTransform: 'capitalize' }]}>
                      {voiceResult.item.category}
                    </Text>
                  </View>
                )}

                {voiceResult.item.location && (
                  <View style={styles.detailRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="location" size={18} color="#3B82F6" />
                      <Text style={[styles.detailLabel, { color: colors.textSecondary, marginLeft: 8 }]}>
                        Location
                      </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text, textTransform: 'capitalize' }]}>
                      {voiceResult.item.location}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={18} color="#8B5CF6" />
                    <Text style={[styles.detailLabel, { color: colors.textSecondary, marginLeft: 8 }]}>
                      Confidence
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 60,
                      height: 6,
                      backgroundColor: isDark ? '#374151' : '#E5E7EB',
                      borderRadius: 3,
                      overflow: 'hidden',
                      marginRight: 8,
                    }}>
                      <View style={{
                        width: `${voiceResult.confidence * 100}%`,
                        height: '100%',
                        backgroundColor: voiceResult.confidence > 0.7 ? '#10B981' : voiceResult.confidence > 0.5 ? '#F59E0B' : '#EF4444',
                      }} />
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {(voiceResult.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={cancelAction}
                  disabled={micState === 'processing'}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>✕ Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={confirmAndAddToInventory}
                  disabled={micState === 'processing'}
                >
                  <LinearGradient
                    colors={micState === 'processing' ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
                    style={styles.confirmGradient}
                  >
                    {micState === 'processing' ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={styles.confirmButtonText}>Adding...</Text>
                      </>
                    ) : (
                      <Text style={styles.confirmButtonText}>✓ Confirm & Add</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Quick Commands */}
          <View style={styles.quickCommands}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Commands:</Text>
            {[
              'Add 2 bottles of milk to pantry',
              'Add 6 eggs to fridge',
              'Add 3 apples to fruit basket',
              'Add bread to kitchen',
            ].map((command, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.commandCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setInputText(command);
                  inputRef.current?.focus();
                }}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                <Text style={[styles.commandText, { color: colors.textSecondary }]}>
                  "{command}"
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Color Legend */}
          <View style={[styles.legendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.legendTitle, { color: colors.text }]}>
              🎨 Microphone States:
            </Text>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Purple = Ready
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Green = Listening
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                Orange = Processing
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Colorful Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: successScaleAnim }],
              width: '100%',
              maxWidth: 350,
            }}
          >
            <LinearGradient
              colors={['#10B981', '#059669', '#047857']}
              style={{
                borderRadius: 28,
                padding: 32,
                alignItems: 'center',
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 15,
              }}
            >
              {/* Success Icon with Animation */}
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}
              >
                <Ionicons name="checkmark-circle" size={70} color="white" />
              </View>

              {/* Success Text */}
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                Success! 🎉
              </Text>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.95)',
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {successItemName}
              </Text>

              <Text
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.85)',
                  textAlign: 'center',
                  marginBottom: 32,
                }}
              >
                has been added to your inventory!
              </Text>

              {/* Action Buttons */}
              <View style={{ width: '100%', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    handleCloseSuccessModal();
                    router.push('/inventory');
                  }}
                  style={{
                    backgroundColor: 'white',
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text style={{ color: '#059669', fontWeight: '700', fontSize: 17 }}>
                    📦 View Inventory
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleCloseSuccessModal();
                    inputRef.current?.focus();
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 17 }}>
                    ➕ Add Another Item
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  micButtonListening: {
    transform: [{ scale: 1.1 }],
  },
  micGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micStatus: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
  },
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  stateDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stateText: {
    fontSize: 14,
  },
  inputCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  processButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  processGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jsonLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  jsonContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  resultDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  quickCommands: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  commandText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  legendCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
  },
});
