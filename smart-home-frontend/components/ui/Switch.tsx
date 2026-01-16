import React from 'react';
import { View, Text, Switch as RNSwitch, ViewStyle, TextStyle } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
  labelStyle,
  descriptionStyle,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, marginRight: 16 }}>
        {label && (
          <Text
            style={[
              {
                fontSize: 16,
                fontWeight: '500',
                color: '#1F2937',
                marginBottom: description ? 4 : 0,
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        )}
        {description && (
          <Text
            style={[
              {
                fontSize: 14,
                color: '#6B7280',
                lineHeight: 20,
              },
              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
        thumbColor={value ? '#3B82F6' : '#F9FAFB'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
};

export default Switch;