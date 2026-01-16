import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  disabled?: boolean;
  divider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon = 'chevron-forward',
  rightElement,
  onPress,
  onRightPress,
  style,
  titleStyle,
  subtitleStyle,
  disabled = false,
  divider = true,
}) => {
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    ...(divider && {
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    }),
    ...(disabled && {
      opacity: 0.5,
    }),
    ...style,
  };

  const content = (
    <>
      {leftIcon && (
        <View style={{ marginRight: 16 }}>
          <Ionicons name={leftIcon} size={24} color="#6B7280" />
        </View>
      )}
      
      <View style={{ flex: 1 }}>
        <Text
          style={[
            {
              fontSize: 16,
              fontWeight: '500',
              color: '#1F2937',
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              {
                fontSize: 14,
                color: '#6B7280',
                marginTop: 2,
              },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightElement || (
        <TouchableOpacity
          onPress={onRightPress || onPress}
          disabled={disabled}
          style={{ padding: 4 }}
        >
          <Ionicons name={rightIcon} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

export default ListItem;