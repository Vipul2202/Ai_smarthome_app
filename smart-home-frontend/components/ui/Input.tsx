import React, { forwardRef } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInputProps,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const getInputHeight = () => {
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 56;
      default: return 48;
    }
  };

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: getInputHeight(),
      paddingHorizontal: 16,
      borderRadius: 8,
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      paddingLeft: leftIcon ? 40 : 16,
      paddingRight: rightIcon ? 40 : 16,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: '#F3F4F6',
          borderWidth: 0,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#3B82F6',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: error ? '#EF4444' : '#D1D5DB',
        };
    }
  };

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label && (
        <Text style={[{
          fontSize: 14,
          fontWeight: '500',
          color: '#374151',
          marginBottom: 8,
        }, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={{ position: 'relative' }}>
        {leftIcon && (
          <View style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: [{ translateY: -10 }],
            zIndex: 10,
          }}>
            <Ionicons name={leftIcon} size={20} color="#9CA3AF" />
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[getInputStyle(), { color: '#111827' }, inputStyle]}
          placeholderTextColor={props.placeholderTextColor || '#9CA3AF'}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: [{ translateY: -10 }],
            }}
          >
            <Ionicons name={rightIcon} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[{
          fontSize: 14,
          color: '#EF4444',
          marginTop: 4,
        }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';