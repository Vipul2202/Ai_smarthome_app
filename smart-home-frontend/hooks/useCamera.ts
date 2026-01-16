import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Alert } from 'react-native';

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      const hasAllPermissions = 
        cameraPermission.status === 'granted' && 
        mediaLibraryPermission.status === 'granted';
      
      setHasPermission(hasAllPermissions);
      return hasAllPermissions;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
      return false;
    }
  };

  const takePhoto = async (options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
  }) => {
    setIsLoading(true);
    try {
      const hasPermissions = hasPermission ?? await requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [4, 3],
        quality: options?.quality ?? 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: 'image' as const,
        };
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
    allowsMultipleSelection?: boolean;
  }) => {
    setIsLoading(true);
    try {
      const hasPermissions = hasPermission ?? await requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permission Required',
          'Media library permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [4, 3],
        quality: options?.quality ?? 0.8,
        allowsMultipleSelection: options?.allowsMultipleSelection ?? false,
      });

      if (!result.canceled && result.assets[0]) {
        if (options?.allowsMultipleSelection) {
          return result.assets.map(asset => ({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            type: 'image' as const,
          }));
        }
        
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: 'image' as const,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePicker = (options?: {
    quality?: number;
    allowsEditing?: boolean;
    aspect?: [number, number];
  }) => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: () => takePhoto(options) },
        { text: 'Photo Library', onPress: () => pickImage(options) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return {
    hasPermission,
    isLoading,
    requestPermissions,
    takePhoto,
    pickImage,
    showImagePicker,
  };
};