import React from 'react';
import { View, Text, ViewProps, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  containerStyle,
  textStyle,
  ...props
}) => {
  const getVariantStyles = (): { backgroundColor: string; color: string } => {
    switch (variant) {
      case 'success':
        return { backgroundColor: '#DCFCE7', color: '#166534' };
      case 'warning':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'danger':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' };
      case 'info':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
      case 'secondary':
        return { backgroundColor: '#F3E8FF', color: '#7C3AED' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  };

  const getSizeStyles = (): { paddingHorizontal: number; paddingVertical: number; fontSize: number } => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 8, paddingVertical: 2, fontSize: 12 };
      case 'lg':
        return { paddingHorizontal: 16, paddingVertical: 8, fontSize: 16 };
      default:
        return { paddingHorizontal: 12, paddingVertical: 4, fontSize: 14 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const badgeStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: variantStyles.backgroundColor,
    borderRadius: rounded ? 20 : 4,
    ...sizeStyles,
    ...containerStyle,
  };

  const badgeTextStyle: TextStyle = {
    color: variantStyles.color,
    fontSize: sizeStyles.fontSize,
    fontWeight: '500',
    ...textStyle,
  };

  return (
    <View style={badgeStyle} {...props}>
      {typeof children === 'string' ? (
        <Text style={badgeTextStyle}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'good' | 'warning' | 'critical' | 'expired';
  text?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const statusConfig = {
    good: { variant: 'success' as const, text: text || 'Good' },
    warning: { variant: 'warning' as const, text: text || 'Warning' },
    critical: { variant: 'danger' as const, text: text || 'Critical' },
    expired: { variant: 'danger' as const, text: text || 'Expired' }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size="sm">
      {config.text}
    </Badge>
  );
};