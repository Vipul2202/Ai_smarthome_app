import React, { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

// Global recording instance to prevent multiple recordings
let globalRecording: Audio.Recording | null = null;
let globalRecordingInUse = false;

export const useLocalVoiceRecording = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isRecordingActive = recordingState === 'recording' || recordingState === 'processing';

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Microphone permission not granted');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error requesting permissions:', err);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      // If already recording, don't start another
      if (isRecordingActive || globalRecordingInUse) {
        console.log('🔄 Recording already in progress, ignoring request');
        return;
      }

      // Mark global recording as in use
      globalRecordingInUse = true;
      setError(null);
      setTranscript('');
      
      // Stop any existing recording first
      if (globalRecording) {
        console.log('🛑 Stopping existing global recording...');
        try {
          await globalRecording.stopAndUnloadAsync();
        } catch (stopError) {
          console.log('Error stopping existing recording:', stopError);
        }
        globalRecording = null;
      }
      
      if (recordingRef.current) {
        console.log('🛑 Stopping existing local recording...');
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (stopError) {
          console.log('Error stopping existing recording:', stopError);
        }
        recordingRef.current = null;
      }
      
      console.log('🎤 Requesting microphone permission...');
      
      // Request permission
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Microphone permission denied');
        setRecordingState('error');
        globalRecordingInUse = false;
        return;
      }

      console.log('🎤 Setting audio mode...');
      
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('🎤 Creating recording...');
      
      // Create recording - try high quality first, fallback to basic if needed
      const recording = new Audio.Recording();
      
      try {
        // Try high quality recording first
        await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      } catch (highQualityError) {
        console.log('High quality recording failed, trying basic:', highQualityError);
        try {
          // Fallback to basic recording options
          await recording.prepareToRecordAsync({
            android: {
              extension: '.m4a',
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
              sampleRate: 44100,
              numberOfChannels: 1,
              bitRate: 128000,
            },
            ios: {
              extension: '.m4a',
              outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
              audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
              sampleRate: 44100,
              numberOfChannels: 1,
              bitRate: 128000,
            },
          });
        } catch (basicError) {
          console.log('Basic recording also failed, trying minimal:', basicError);
          // Last resort - minimal recording options
          await recording.prepareToRecordAsync({
            android: {
              extension: '.m4a',
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            },
            ios: {
              extension: '.m4a',
              outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            },
          });
        }
      }

      await recording.startAsync();
      
      // Set both global and local references
      globalRecording = recording;
      recordingRef.current = recording;
      setRecordingState('recording');
      
      console.log('✅ Recording started successfully');
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      
      // Provide more specific error messages but don't disable functionality
      let errorMessage = 'Failed to start recording. ';
      if (err.message?.includes('Permission')) {
        errorMessage = 'Microphone permission required. Please enable in device settings.';
      } else if (err.message?.includes('Audio session')) {
        errorMessage = 'Audio system busy. Please try again in a moment.';
      } else if (err.message?.includes('Only one Recording object')) {
        errorMessage = 'Another recording is active. Please wait and try again.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
      setRecordingState('error');
      globalRecordingInUse = false;
      
      // Clean up on error
      if (globalRecording) {
        try {
          await globalRecording.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.log('Error during cleanup:', cleanupError);
        }
        globalRecording = null;
      }
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.log('Error during cleanup:', cleanupError);
        }
        recordingRef.current = null;
      }
    }
  };

  const stopRecording = async () => {
    try {
      const currentRecording = recordingRef.current || globalRecording;
      if (!currentRecording) {
        console.log('No recording to stop');
        globalRecordingInUse = false;
        return;
      }

      console.log('⏹️ Stopping recording...');
      setRecordingState('processing');
      
      // Stop recording with error handling
      let uri: string | null = null;
      try {
        await currentRecording.stopAndUnloadAsync();
        uri = currentRecording.getURI();
      } catch (stopError) {
        console.error('Error stopping recording:', stopError);
        throw new Error('Failed to stop recording properly');
      } finally {
        recordingRef.current = null;
        globalRecording = null;
        globalRecordingInUse = false;
      }

      if (!uri) {
        throw new Error('No recording URI available');
      }

      console.log('📤 Uploading audio for transcription...');
      
      // Upload to backend for transcription
      const token = await AsyncStorage.getItem('authToken');
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';

      // Create form data with proper file handling
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
          // Don't set Content-Type header, let FormData handle it
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription error response:', errorText);
        throw new Error(`Backend transcription failed. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Transcription received:', data.transcript);
      
      setTranscript(data.transcript || '');
      setRecordingState('idle');
    } catch (err: any) {
      console.error('Failed to stop recording:', err);
      
      // Provide helpful error message
      let errorMessage = 'Failed to process audio. ';
      if (err.message.includes('Network request failed')) {
        errorMessage = 'Network error. Check internet connection and try again.';
      } else if (err.message.includes('Backend transcription failed')) {
        errorMessage = 'Transcription service unavailable. Please use text input.';
      } else if (err.message.includes('Failed to stop recording')) {
        errorMessage = 'Recording error. Please try again or use text input.';
      } else {
        errorMessage += 'Please try again or use text input.';
      }
      
      setError(errorMessage);
      setRecordingState('error');
      globalRecordingInUse = false;
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
    if (recordingState !== 'recording' && recordingState !== 'processing') {
      setRecordingState('idle');
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
      if (globalRecording) {
        globalRecording.stopAndUnloadAsync().catch(() => {});
        globalRecording = null;
      }
      globalRecordingInUse = false;
    };
  }, []);

  return {
    recordingState,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    isRecordingActive,
  };
};