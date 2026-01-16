import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Image,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BarcodeResult {
  code: string;
  format: string;
  product?: {
    name: string;
    brand: string;
    category: string;
    image?: string;
  };
}

export default function BarcodeScannerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      setError(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo) {
        setCapturedImage(photo.uri);
        
        // Simulate barcode processing (in real app, you'd send to a barcode API)
        await processBarcode(photo.base64 || '');
      }
      
    } catch (error) {
      console.error('Photo capture failed:', error);
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processBarcode = async (base64Image: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock barcode detection (in real app, use a barcode scanning service)
      const mockBarcodes = [
        {
          code: '1234567890123',
          format: 'EAN-13',
          product: {
            name: 'Organic Milk',
            brand: 'Fresh Farm',
            category: 'Dairy',
            image: 'https://via.placeholder.com/100x100?text=Milk'
          }
        },
        {
          code: '9876543210987',
          format: 'EAN-13',
          product: {
            name: 'Whole Wheat Bread',
            brand: 'Baker\'s Best',
            category: 'Bakery',
            image: 'https://via.placeholder.com/100x100?text=Bread'
          }
        }
      ];

      // Randomly select a mock result
      const randomResult = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      setScanResult(randomResult);
      
    } catch (error) {
      console.error('Barcode processing failed:', error);
      setError('Could not detect barcode. Please try again with better lighting.');
    }
  };

  const handleUseProduct = () => {
    if (!scanResult) return;

    // Navigate to add item screen with barcode data and product info
    router.push({
      pathname: '/inventory/add',
      params: {
        barcode: scanResult.code,
        productName: scanResult.product?.name || '',
        productBrand: scanResult.product?.brand || '',
        productCategory: scanResult.product?.category || '',
        productImage: scanResult.product?.image || '',
      }
    });
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setScanResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permissions.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        setCapturedImage(result.assets[0].uri);
        await processBarcode(result.assets[0].base64 || '');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Gallery pick failed:', error);
      setError('Failed to pick image from gallery.');
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContainer}>
          <Text style={styles.text}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="camera-off" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Camera Permission Denied</Text>
          <Text style={styles.errorText}>
            Please enable camera permissions to scan barcodes.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={pickImageFromGallery}>
              <Text style={styles.primaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Camera or Result View */}
      {!capturedImage && !scanResult ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />

          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan Barcode</Text>
              <TouchableOpacity style={styles.headerButton} onPress={pickImageFromGallery}>
                <Ionicons name="images" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Scanning Frame */}
            <View style={styles.scanningArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                Position the barcode within the frame
              </Text>
              <Text style={styles.instructionSubtext}>
                Tap the capture button to scan
              </Text>
              
              <TouchableOpacity 
                style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]} 
                onPress={capturePhoto}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Ionicons name="hourglass" size={32} color="white" />
                ) : (
                  <Ionicons name="camera" size={32} color="white" />
                )}
              </TouchableOpacity>
              
              {isProcessing && (
                <Text style={styles.processingText}>Processing barcode...</Text>
              )}
            </View>
          </View>
        </>
      ) : (
        /* Result Screen */
        <View style={[styles.resultContainer, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
          {/* Header */}
          <View style={[styles.resultHeader, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text style={[styles.resultHeaderTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Scan Result
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.resultContent}>
            {/* Captured Image */}
            {capturedImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: capturedImage }} style={styles.capturedImageStyle} />
              </View>
            )}

            {/* Scan Result */}
            {scanResult ? (
              <View style={[styles.resultCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                </View>
                
                <Text style={[styles.successTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Barcode Detected!
                </Text>
                
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                    {scanResult.product?.name || 'Unknown Product'}
                  </Text>
                  <Text style={[styles.productBrand, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {scanResult.product?.brand || 'Unknown Brand'}
                  </Text>
                  <Text style={[styles.productCategory, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Category: {scanResult.product?.category || 'Unknown'}
                  </Text>
                  <Text style={[styles.barcodeText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    Barcode: {scanResult.code}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Scan Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.useButton} onPress={handleUseProduct}>
                    <Text style={styles.useButtonText}>Add to Inventory</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : error ? (
              <View style={[styles.resultCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
                <View style={styles.errorIcon}>
                  <Ionicons name="alert-circle" size={48} color="#EF4444" />
                </View>
                
                <Text style={[styles.errorTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Scanning Failed
                </Text>
                <Text style={[styles.errorMessage, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  {error}
                </Text>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.useButton} onPress={() => router.back()}>
                    <Text style={styles.useButtonText}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scanningArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7 * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3B82F6',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  processingText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultContent: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  capturedImageStyle: {
    width: screenWidth * 0.8,
    height: (screenWidth * 0.8) * 0.75,
    borderRadius: 12,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  successIcon: {
    marginBottom: 16,
  },
  errorIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  productBrand: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  productCategory: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  barcodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  useButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});