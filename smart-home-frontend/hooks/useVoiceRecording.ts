import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceRecordingReturn {
  recordingState: RecordingState;
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscript: () => void;
  error: string | null;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    // Request audio permissions on mount
    requestPermissions();

    return () => {
      // Cleanup
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Microphone permission not granted');
      }
    } catch (err) {
      console.error('Error requesting permissions:', err);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      
      // Stop any existing recording first
      if (recordingRef.current) {
        console.log('🛑 Stopping existing recording...');
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      
      console.log('🎤 Requesting microphone permission...');
      
      // Request permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission denied');
        setRecordingState('error');
        return;
      }

      console.log('🎤 Setting audio mode...');
      
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 Creating recording...');
      
      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setRecordingState('recording');
      
      console.log('✅ Recording started successfully');
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError(err.message || 'Failed to start recording');
      setRecordingState('error');
      
      // Clean up on error
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        console.log('No recording to stop');
        return;
      }

      console.log('⏹️ Stopping recording...');
      setRecordingState('processing');
      
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

      console.log('📤 Uploading audio for transcription...');
      
      // Upload to backend for transcription
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      // Create form data
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await fetch(`${apiUrl}/api/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription error response:', errorText);
        throw new Error(`Backend transcription failed. Please check:\n• Backend is running\n• OpenAI API key is configured\n• Internet connection is stable`);
      }

      const data = await response.json();
      console.log('✅ Transcription received:', data.transcript);
      
      setTranscript(data.transcript || '');
      setRecordingState('idle');
    } catch (err: any) {
      console.error('Failed to stop recording:', err);
      
      // Provide helpful error message
      let errorMessage = 'Failed to transcribe audio. ';
      if (err.message.includes('Network request failed')) {
        errorMessage += 'Check internet connection and backend is running.';
      } else if (err.message.includes('Backend transcription failed')) {
        errorMessage = err.message;
      } else {
        errorMessage += 'Please try again or use manual input.';
      }
      
      setError(errorMessage);
      setRecordingState('error');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
    setRecordingState('idle');
  };

  return {
    recordingState,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    error,
  };
};
