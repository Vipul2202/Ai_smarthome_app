import React from 'react';
import { View, ActivityIndicator, Text, ViewStyle, useColorScheme } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  overlay?: boolean;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  overlay = false,
  containerStyle,
  style
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const spinnerColor = color || '#3B82F6';

  if (overlay) {
    return (
      <View 
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }, style]}
      >
        <View style={{
          backgroundColor: isDark ? '#374151' : '#FFFFFF',
          borderRadius: 8,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <ActivityIndicator size={size} color={spinnerColor} />
          {text && (
            <Text style={{
              color: isDark ? '#D1D5DB' : '#374151',
              marginTop: 12,
              textAlign: 'center',
            }}>
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View 
      style={[{
        justifyContent: 'center',
        alignItems: 'center',
      }, containerStyle, style]}
    >
      <ActivityIndicator size={size} color={spinnerColor} />
      {text && (
        <Text style={{
          color: isDark ? '#D1D5DB' : '#374151',
          marginTop: 8,
          textAlign: 'center',
        }}>
          {text}
        </Text>
      )}
    </View>
  );
};

// Full Screen Loading Component
interface FullScreenLoadingProps {
  text?: string;
  logo?: React.ReactNode;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ 
  text = 'Loading...', 
  logo 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#111827' : '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {logo && <View style={{ marginBottom: 32 }}>{logo}</View>}
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={{
        color: isDark ? '#D1D5DB' : '#374151',
        marginTop: 16,
        fontSize: 18,
      }}>
        {text}
      </Text>
    </View>
  );
};

// Skeleton Loader Component
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  containerStyle?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  containerStyle
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[{
        backgroundColor: isDark ? '#374151' : '#E5E7EB',
        width,
        height,
        borderRadius,
      }, containerStyle]}
    />
  );
};

// Skeleton List Component
interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  spacing?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  itemHeight = 60,
  spacing = 12
}) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={{ marginBottom: spacing }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={40} height={40} borderRadius={20} containerStyle={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="70%" height={16} containerStyle={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      </View>
    ))}
  </View>
);