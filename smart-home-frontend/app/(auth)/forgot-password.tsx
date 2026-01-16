import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Mock forgot password functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEmailSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={{ flex: 1 }}
      >
        <StatusBar style="light" />
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          paddingHorizontal: 32,
        }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 96,
              height: 96,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
            }}>
              <Ionicons name="mail-outline" size={40} color="#3B82F6" />
            </View>
            <Text style={{ 
              color: 'white', 
              fontSize: 28, 
              fontWeight: 'bold', 
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Check Your Email
            </Text>
            <Text style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: 16, 
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 24,
            }}>
              We've sent a password reset link to {email}
            </Text>
            
            <Button
              title="Try Another Email"
              variant="outline"
              onPress={() => setIsEmailSent(false)}
              style={{ 
                marginBottom: 16,
                borderColor: 'rgba(255,255,255,0.2)',
                backgroundColor: 'transparent',
              }}
              textStyle={{ color: 'white' }}
            />
            
            <Link href="/(auth)/login" asChild>
              <Button
                title="Back to Sign In"
                variant="ghost"
                onPress={() => {}}
              />
            </Link>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#3B82F6', '#1E40AF']}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />
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
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <View style={{
                width: 96,
                height: 96,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Ionicons name="lock-closed-outline" size={40} color="#3B82F6" />
              </View>
              <Text style={{ 
                color: 'white', 
                fontSize: 28, 
                fontWeight: 'bold', 
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Reset Password
              </Text>
              <Text style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: 16, 
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Enter your email address and we'll send you a link to reset your password
              </Text>
            </View>

            {/* Form */}
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
                containerStyle={{ marginBottom: 16 }}
              />

              <Button
                title={isLoading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginTop: 8 }}
              />
            </View>

            {/* Back to Login */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: 32,
            }}>
              <Text style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: 16,
              }}>
                Remember your password? 
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
                    color: 'white', 
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
    </LinearGradient>
  );
}