import React from 'react';
import { View, Text } from 'react-native';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        
        <Text
          style={{
            fontSize: 16,
            color: '#6B7280',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          {message}
        </Text>
        
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            width: '100%',
          }}
        >
          <Button
            title={cancelText}
            onPress={onClose}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title={confirmText}
            onPress={handleConfirm}
            variant={variant === 'danger' ? 'danger' : 'primary'}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog;