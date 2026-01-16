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
import { useAuth } from '@/providers/AuthProvider';
import { useHouse } from '@/contexts/HouseContext';

export default function CreateHouseScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { createHouse } = useHouse();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'House name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'House name must be at least 2 characters';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateHouse = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      const result = await createHouse(name.trim(), description.trim());
      
      if (result.success) {
        Alert.alert(
          'Success',
          'House created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'), // Redirect to dashboard
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create house. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create house:', error);
      Alert.alert('Error', 'Failed to create house. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Your First House</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Let's set up your smart home
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* House Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'CC']}
              style={styles.iconGradient}
            >
              <Text style={styles.iconEmoji}>🏠</Text>
            </LinearGradient>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* House Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>House Name</Text>
              <View style={[
                styles.inputWrapper, 
                { backgroundColor: colors.surface, borderColor: colors.border },
                errors.name && { borderColor: colors.error }
              ]}>
                <Ionicons name="home-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="e.g., My Home, Summer House"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <View style={[
                styles.inputWrapper, 
                styles.textAreaWrapper,
                { backgroundColor: colors.surface, borderColor: colors.border },
                errors.description && { borderColor: colors.error }
              ]}>
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color={colors.textSecondary} 
                  style={styles.textAreaIcon} 
                />
                <TextInput
                  style={[styles.textInput, styles.textArea, { color: colors.text }]}
                  placeholder="Describe your house (rooms, features, etc.)"
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description) setErrors({ ...errors, description: undefined });
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              {errors.description && <Text style={[styles.errorText, { color: colors.error }]}>{errors.description}</Text>}
            </View>

            {/* Example Houses */}
            <View style={[styles.examplesContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.examplesTitle, { color: colors.text }]}>Example Houses:</Text>
              <TouchableOpacity
                style={[styles.exampleItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setName('Family Home');
                  setDescription('Main family house with kitchen, living room, 3 bedrooms, and 2 bathrooms');
                }}
              >
                <Text style={[styles.exampleName, { color: colors.text }]}>🏡 Family Home</Text>
                <Text style={[styles.exampleDesc, { color: colors.textSecondary }]}>
                  Main family house with kitchen, living room, 3 bedrooms...
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.exampleItem}
                onPress={() => {
                  setName('Vacation Cabin');
                  setDescription('Cozy cabin in the mountains with fireplace, kitchen, and outdoor deck');
                }}
              >
                <Text style={[styles.exampleName, { color: colors.text }]}>🏔️ Vacation Cabin</Text>
                <Text style={[styles.exampleDesc, { color: colors.textSecondary }]}>
                  Cozy cabin in the mountains with fireplace, kitchen...
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              onPress={handleCreateHouse}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                style={styles.createGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                {isLoading ? (
                  <Text style={styles.createButtonText}>Creating...</Text>
                ) : (
                  <Text style={styles.createButtonText}>Create House</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 50,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  examplesContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  exampleItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  exampleName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  exampleDesc: {
    fontSize: 12,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});