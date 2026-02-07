import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHouseSharing } from '../../hooks/useHouseSharing';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function AcceptInviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { acceptHouseInvitation } = useHouseSharing();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [houseName, setHouseName] = useState<string>('');

  const handleAcceptInvitation = async () => {
    if (!code) {
      setError('Invalid invitation code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const house = await acceptHouseInvitation(code);
      setHouseName(house.name);
      setSuccess(true);
      
      // Navigate to the house after a short delay
      setTimeout(() => {
        router.replace('/(tabs)/my-houses');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Invitation Accepted',
            headerBackVisible: false,
          }}
        />
        <View style={styles.container}>
          <Card style={styles.card}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Welcome!</Text>
            <Text style={styles.successMessage}>
              You now have access to "{houseName}"
            </Text>
            <Text style={styles.redirectText}>
              Redirecting to your houses...
            </Text>
          </Card>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Invitation Error',
          }}
        />
        <View style={styles.container}>
          <Card style={styles.card}>
            <View style={styles.errorIcon}>
              <Ionicons name="close-circle" size={80} color="#ef4444" />
            </View>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button
              title="Go to My Houses"
              onPress={() => router.replace('/(tabs)/my-houses')}
              style={styles.button}
            />
          </Card>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Accept Invitation',
        }}
      />
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.inviteIcon}>
            <Ionicons name="home" size={80} color="#3b82f6" />
          </View>
          <Text style={styles.title}>House Invitation</Text>
          <Text style={styles.message}>
            You've been invited to access a shared house inventory.
          </Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              <Text style={styles.infoText}>Secure access</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>Collaborate with others</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="sync" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>Real-time updates</Text>
            </View>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Accepting invitation...</Text>
            </View>
          ) : (
            <Button
              title="Accept Invitation"
              onPress={handleAcceptInvitation}
              style={styles.button}
            />
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  inviteIcon: {
    marginBottom: 24,
  },
  successIcon: {
    marginBottom: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  redirectText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});
