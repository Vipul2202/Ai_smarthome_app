import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NetworkDiagnostic from '@/components/NetworkDiagnostic';

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showNetworkDiagnostic, setShowNetworkDiagnostic] = useState(false);
  
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Check if user has a previously selected house
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const lastSelectedHouseId = await AsyncStorage.getItem('selectedHouseId');
        
        if (lastSelectedHouseId) {
          console.log('🏠 User has previously selected house, redirecting to dashboard');
          // Redirect directly to dashboard with last selected house
          router.replace('/(tabs)');
        } else {
          console.log('🏠 No previously selected house, user must select');
          // Redirect to main index which will handle house selection flow
          router.replace('/');
        }
      } else {
        // Handle specific error cases
        const errorMessage = result.error || 'Login failed';
        
        if (errorMessage.toLowerCase().includes('user not found') || 
            errorMessage.toLowerCase().includes('invalid credentials') ||
            errorMessage.toLowerCase().includes('user does not exist')) {
          Alert.alert(
            'Account Not Found', 
            'This email is not registered. Please sign up first.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Sign Up', 
                onPress: () => router.push('/(auth)/register')
              }
            ]
          );
        } else {
          Alert.alert('Login Failed', errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Show network diagnostic for network errors
      if (error.message?.includes('Network request failed') || 
          error.message?.includes('fetch')) {
        setShowNetworkDiagnostic(true);
        Alert.alert(
          'Network Error', 
          'Unable to connect to the server. Please check your network connection.',
          [
            { text: 'Show Diagnostic', onPress: () => setShowNetworkDiagnostic(true) },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Login Failed', 'Network error. Please check your connection and try again.');
      }
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
                Welcome Back
              </Text>
              <Text style={{ 
                color: colors.textSecondary, 
                fontSize: 16, 
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Sign in to your Smart Home account
              </Text>
            </View>

            {/* Login Form */}
            <View style={{ gap: 16 }}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                error={errors.password}
                leftIcon="lock-closed-outline"
                variant="filled"
                containerStyle={{ marginBottom: 16 }}
              />

              <Button
                title={isLoading ? 'Signing In...' : 'Sign In'}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginTop: 8 }}
              />

              <Link href="/(auth)/forgot-password" asChild>
                <Button
                  title="Forgot Password?"
                  variant="ghost"
                  style={{ marginTop: 8 }}
                  onPress={() => {}}
                />
              </Link>
            </View>

            {/* Sign Up Link */}
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
                Don't have an account? 
              </Text>
              <Link href="/(auth)/register" asChild>
                <Button
                  title="Sign Up"
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

            {/* Network Diagnostic */}
            {showNetworkDiagnostic && (
              <NetworkDiagnostic 
                onApiUrlFound={() => setShowNetworkDiagnostic(false)}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}