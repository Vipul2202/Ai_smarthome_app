import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { getWorkingApiUrl, resetApiUrl } from '@/utils/api';

interface NetworkDiagnosticProps {
  onApiUrlFound?: (url: string) => void;
}

export default function NetworkDiagnostic({ onApiUrlFound }: NetworkDiagnosticProps) {
  const { colors } = useTheme();
  const [isTestingNetwork, setIsTestingNetwork] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [apiUrl, setApiUrl] = useState<string>('');

  const testNetworkConnection = async () => {
    setIsTestingNetwork(true);
    setNetworkStatus('unknown');
    
    try {
      console.log('Testing network connection...');
      const workingUrl = await getWorkingApiUrl();
      setApiUrl(workingUrl);
      setNetworkStatus('connected');
      onApiUrlFound?.(workingUrl);
      
      Alert.alert(
        'Network Test Successful',
        `Connected to API at: ${workingUrl}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Network test failed:', error);
      setNetworkStatus('failed');
      
      Alert.alert(
        'Network Test Failed',
        'Unable to connect to the backend API. Please check your network connection.',
        [
          { text: 'Retry', onPress: testNetworkConnection },
          { text: 'Cancel' }
        ]
      );
    } finally {
      setIsTestingNetwork(false);
    }
  };

  const resetNetwork = () => {
    resetApiUrl();
    setNetworkStatus('unknown');
    setApiUrl('');
    Alert.alert('Network Reset', 'Network configuration has been reset. Please test connection again.');
  };

  const getStatusIcon = () => {
    switch (networkStatus) {
      case 'connected':
        return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
      case 'failed':
        return <Ionicons name="close-circle" size={24} color="#EF4444" />;
      default:
        return <Ionicons name="help-circle" size={24} color={colors.textSecondary} />;
    }
  };

  const getStatusText = () => {
    switch (networkStatus) {
      case 'connected':
        return `Connected to: ${apiUrl}`;
      case 'failed':
        return 'Connection failed';
      default:
        return 'Network status unknown';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={20} color={colors.text} />
        <Text style={[styles.title, { color: colors.text }]}>Network Diagnostic</Text>
      </View>
      
      <View style={styles.status}>
        {getStatusIcon()}
        <Text style={[styles.statusText, { color: colors.textSecondary }]}>
          {getStatusText()}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={testNetworkConnection}
          disabled={isTestingNetwork}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={styles.buttonText}>
            {isTestingNetwork ? 'Testing...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
          onPress={resetNetwork}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.text} />
          <Text style={[styles.buttonText, { color: colors.text }]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});