import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  containerStyle,
  style,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
    };

    const paddingValue = {
      none: 0,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    }[padding];

    const variantStyle: ViewStyle = (() => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          };
        case 'outlined':
          return {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#D1D5DB',
          };
        case 'filled':
          return {
            backgroundColor: '#F9FAFB',
          };
        default:
          return {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
          };
      }
    })();

    return {
      ...baseStyle,
      ...variantStyle,
      padding: paddingValue,
    };
  };

  return (
    <View
      style={[getCardStyle(), containerStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => (
  <View style={[{ marginBottom: 16 }, style]}>
    {children}
  </View>
);

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => (
  <View style={[{ flex: 1 }, style]}>
    {children}
  </View>
);

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => (
  <View style={[{ 
    marginTop: 16, 
    flexDirection: 'row', 
    justifyContent: 'flex-end',
    gap: 8,
  }, style]}>
    {children}
  </View>
);