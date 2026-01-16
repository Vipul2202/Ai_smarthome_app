import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Conditional import for barcode scanner
let BarCodeScanner: any = null;
if (Platform.OS !== 'web') {
  try {
    const ExpoBarCodeScanner = require('expo-barcode-scanner');
    BarCodeScanner = ExpoBarCodeScanner.BarCodeScanner;
  } catch (error) {
    console.warn('Barcode scanner not available:', error);
  }
}

const { width, height } = Dimensions.get('window');

interface BarcodeScannerProps {
  onBarcodeScanned: (data: { barcode: string; type: string; product?: any }) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeScanned,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (!BarCodeScanner) {
      setError('Barcode scanner not available on this platform');
      return;
    }

    (async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        console.error('Permission request failed:', err);
        setError('Failed to request camera permissions');
      }
    })();
  }, []);

  const onBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!isScanning) return;
    
    setIsScanning(false);
    onBarcodeScanned({
      barcode: data,
      type: type,
    });
  };

  const handleRescan = () => {
    setIsScanning(true);
  };

  const requestPermission = async () => {
    if (!BarCodeScanner) {
      Alert.alert('Error', 'Barcode scanner not available on this platform');
      return;
    }

    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Permission request failed:', err);
      Alert.alert('Error', 'Failed to request camera permissions');
    }
  };

  if (!BarCodeScanner || error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.errorContainer}
        >
          <Ionicons name="warning" size={64} color="#F59E0B" />
          <Text style={styles.errorTitle}>Scanner Not Available</Text>
          <Text style={styles.errorText}>
            {error || 'Barcode scanner is not available on this platform. Please use a physical device.'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.loadingContainer}
        >
          <Text style={styles.loadingText}>Requesting camera permission...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1F2937', '#111827']}
          style={styles.errorContainer}
        >
          <Ionicons name="camera-off" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Camera Permission Denied</Text>
          <Text style={styles.errorText}>
            Please enable camera permissions in your device settings to use the barcode scanner.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={isScanning ? onBarCodeScanned : undefined}
        style={styles.scanner}
        flashMode={flashOn ? 'torch' : 'off'}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Barcode</Text>
          <TouchableOpacity
            style={styles.flashBtn}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons 
              name={flashOn ? 'flash' : 'flash-off'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Scanning Frame */}
        <View style={styles.scanFrame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.scanLine} />
        </View>

        {/* Instructions */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.instructions}
        >
          <Text style={styles.instructionText}>
            Position the barcode within the frame
          </Text>
          <Text style={styles.instructionSubtext}>
            The barcode will be scanned automatically
          </Text>
          {!isScanning && (
            <TouchableOpacity style={styles.rescanButton} onPress={handleRescan}>
              <Text style={styles.rescanButtonText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scanFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#3B82F6',
    borderWidth: 3,
    borderTopLeftRadius: 8,
    top: height * 0.3,
    left: width * 0.2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    right: width * 0.2,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 0,
  },
  bottomLeft: {
    top: height * 0.6,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 0,
  },
  bottomRight: {
    top: height * 0.6,
    right: width * 0.2,
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
  },
  scanLine: {
    position: 'absolute',
    top: height * 0.45,
    left: width * 0.2,
    right: width * 0.2,
    height: 2,
    backgroundColor: '#3B82F6',
    opacity: 0.8,
  },
  instructions: {
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 20,
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
  rescanButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rescanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});