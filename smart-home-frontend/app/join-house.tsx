import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { useHouseSharing } from '@/hooks/useHouseSharing';
import * as Clipboard from 'expo-clipboard';

export default function JoinHouseScreen() {
  const { colors, isDark } = useTheme();
  const { acceptHouseInvitation } = useHouseSharing();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      
      if (!text) {
        Alert.alert('Empty Clipboard', 'No text found in clipboard');
        return;
      }
      
      // Extract code from URL if it's a full link
      if (text.includes('/accept-invite/')) {
        const code = text.split('/accept-invite/')[1].split('?')[0];
        setInviteCode(code);
        Alert.alert('✓ Pasted', 'Invitation code pasted successfully');
      } else {
        setInviteCode(text.trim());
        Alert.alert('✓ Pasted', 'Code pasted from clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleJoinHouse = async () => {
    const trimmedCode = inviteCode.trim();
    
    if (!trimmedCode) {
      Alert.alert('Missing Code', 'Please enter an invitation code');
      return;
    }

    if (trimmedCode.length < 20) {
      Alert.alert('Invalid Code', 'The invitation code seems too short. Please check and try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await acceptHouseInvitation(trimmedCode);
      
      if (result) {
        // Clear the input
        setInviteCode('');
        
        // Navigate to houses list after a short delay
        setTimeout(() => {
          router.replace('/houses');
        }, 1500);
      }
    } catch (error: any) {
      // Silently handle the error - don't log to console
      // The acceptHouseInvitation hook already shows user-friendly alerts
      
      // Check if it's the "own house" error and show helpful message
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('your own house') || 
          errorMessage.toLowerCase().includes('cannot join your own')) {
        Alert.alert(
          'Cannot Use This Code',
          'This invitation code is for your own house. You already own this house and don\'t need to join it.\n\nInvitation codes are meant to be shared with other people who want to access your house.',
          [{ text: 'OK' }]
        );
      }
      // For other errors, the hook already showed an alert
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 8,
    },
    iconGradient: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
      color: colors.textSecondary,
      paddingHorizontal: 16,
    },
    formContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 10,
      color: colors.text,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 2,
      marginBottom: 12,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: isDark ? '#374151' : '#E5E7EB',
    },
    inputWrapperFocused: {
      borderColor: '#3B82F6',
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
    },
    textInput: {
      flex: 1,
      fontSize: 15,
      marginLeft: 12,
      minHeight: 70,
      textAlignVertical: 'top',
      color: colors.text,
    },
    pasteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      borderWidth: 2,
      marginBottom: 24,
      gap: 8,
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      borderColor: '#3B82F6',
    },
    pasteButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#3B82F6',
    },
    infoBox: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 24,
      gap: 12,
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
      borderColor: isDark ? '#2563EB' : '#BFDBFE',
    },
    infoTextContainer: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.text,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    joinButton: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
      shadowColor: '#3B82F6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    joinButtonDisabled: {
      opacity: 0.6,
    },
    joinGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      gap: 10,
    },
    joinButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: 'white',
    },
    cancelButton: {
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: isDark ? '#374151' : '#F3F4F6',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.iconGradient}
            >
              <Ionicons name="enter" size={50} color="white" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Join a Shared House
          </Text>
          <Text style={styles.subtitle}>
            Enter the invitation code you received to access a shared house inventory
          </Text>

          {/* Input Section */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>
              Invitation Code
            </Text>
            
            <View style={[
              styles.inputWrapper,
              inviteCode.length > 0 && styles.inputWrapperFocused
            ]}>
              <Ionicons name="key" size={20} color={inviteCode.length > 0 ? '#3B82F6' : colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                placeholder="Paste your 32-character invitation code here"
                placeholderTextColor={colors.textSecondary}
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Paste Button */}
            <TouchableOpacity
              style={styles.pasteButton}
              onPress={handlePasteFromClipboard}
            >
              <Ionicons name="clipboard" size={20} color="#3B82F6" />
              <Text style={styles.pasteButtonText}>
                Paste from Clipboard
              </Text>
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>
                  How to get an invitation code?
                </Text>
                <Text style={styles.infoText}>
                  Ask the house owner to share their house with you. They can create an invitation from their "Manage Sharing" screen and send you the code.
                </Text>
              </View>
            </View>

            {/* Join Button */}
            <TouchableOpacity
              style={[styles.joinButton, isLoading && styles.joinButtonDisabled]}
              onPress={handleJoinHouse}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.joinGradient}
              >
                {isLoading ? (
                  <>
                    <Ionicons name="hourglass" size={20} color="white" />
                    <Text style={styles.joinButtonText}>Joining...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.joinButtonText}>Join House</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
