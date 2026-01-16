import React from 'react';
import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  size?: number;
  showFallback?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  user, 
  size = 60, 
  showFallback = true 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const fallbackStyle = {
    ...avatarStyle,
    backgroundColor: '#3B82F6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const textStyle = {
    color: 'white',
    fontSize: size * 0.4,
    fontWeight: 'bold' as const,
  };

  // If user has avatar URL, try to load it
  if (user?.avatar) {
    return (
      <Image
        source={{ uri: user.avatar }}
        style={avatarStyle}
        onError={() => {
          console.log('Avatar image failed to load');
        }}
      />
    );
  }

  // Fallback to initials
  if (showFallback && user?.name) {
    const initials = user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View style={fallbackStyle}>
        <Text style={textStyle}>{initials}</Text>
      </View>
    );
  }

  // Default avatar icon
  return (
    <View style={[fallbackStyle, { backgroundColor: isDark ? '#374151' : '#9CA3AF' }]}>
      <Ionicons name="person" size={size * 0.5} color="white" />
    </View>
  );
};

// Profile avatar with different color schemes
export const ProfileAvatar: React.FC<AvatarProps & { variant?: 'primary' | 'success' | 'warning' | 'danger' }> = ({ 
  user, 
  size = 60, 
  variant = 'primary' 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const fallbackStyle = {
    ...avatarStyle,
    backgroundColor: colors[variant],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  };

  const textStyle = {
    color: 'white',
    fontSize: size * 0.35,
    fontWeight: 'bold' as const,
  };

  // If user has avatar URL, try to load it
  if (user?.avatar) {
    return (
      <View style={fallbackStyle}>
        <Image
          source={{ uri: user.avatar }}
          style={[avatarStyle, { borderWidth: 0 }]}
          onError={() => {
            console.log('Avatar image failed to load');
          }}
        />
      </View>
    );
  }

  // Fallback to initials with enhanced styling
  if (user?.name) {
    const initials = user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View style={fallbackStyle}>
        <Text style={textStyle}>{initials}</Text>
      </View>
    );
  }

  // Default enhanced avatar icon
  return (
    <View style={fallbackStyle}>
      <Ionicons name="person" size={size * 0.45} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  // Add any additional styles here if needed
});