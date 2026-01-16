import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 6) errors.push('Password must be at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { colors, isDark } = useTheme();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register(name.trim(), email, password);
      if (result.success) {
        // Redirect to main index which will handle the flow (will go to create house for new users)
        router.replace('/');
      } else {
        Alert.alert('Registration Failed', result.error || 'Please try again');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header with Theme Toggle */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 20,
      }}>
        <View />
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            paddingHorizontal: 32,
            paddingVertical: 40,
          }}>
            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Text style={{ fontSize: 48 }}>🏠</Text>
              </LinearGradient>
              <Text style={{ 
                color: colors.text, 
                fontSize: 28, 
                fontWeight: 'bold', 
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Create Account
              </Text>
              <Text style={{ 
                color: colors.textSecondary, 
                fontSize: 16, 
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Join Smart Home and start managing your inventory
              </Text>
            </View>

            {/* Register Form */}
            <View style={{ gap: 16 }}>
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoComplete="name"
                error={errors.name}
                leftIcon="person-outline"
                variant="filled"
                containerStyle={{ marginBottom: 8 }}
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon="mail-outline"
                variant="filled"
                containerStyle={{ marginBottom: 8 }}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                error={errors.password}
                leftIcon="lock-closed-outline"
                variant="filled"
                containerStyle={{ marginBottom: 8 }}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
                error={errors.confirmPassword}
                leftIcon="lock-closed-outline"
                variant="filled"
                containerStyle={{ marginBottom: 16 }}
              />

              <Button
                title={isLoading ? 'Creating Account...' : 'Create Account'}
                onPress={handleRegister}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginTop: 8 }}
              />
            </View>

            {/* Sign In Link */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: 32,
            }}>
              <Text style={{ 
                color: colors.textSecondary, 
                fontSize: 16,
              }}>
                Already have an account? 
              </Text>
              <Link href="/(auth)/login" asChild>
                <Button
                  title="Sign In"
                  variant="ghost"
                  style={{ 
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    minHeight: 32,
                  }}
                  textStyle={{ 
                    color: colors.primary, 
                    fontWeight: '600',
                    fontSize: 16,
                  }}
                  onPress={() => {}}
                />
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}