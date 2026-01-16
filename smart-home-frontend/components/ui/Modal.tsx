import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  ScrollView,
  ModalProps as RNModalProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModalProps extends Omit<RNModalProps, 'children'> {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'bottom' | 'top';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  scrollable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  scrollable = false,
  ...props
}) => {
  const sizeStyles = {
    sm: { width: screenWidth * 0.8, maxHeight: screenHeight * 0.4 },
    md: { width: screenWidth * 0.9, maxHeight: screenHeight * 0.6 },
    lg: { width: screenWidth * 0.95, maxHeight: screenHeight * 0.8 },
    xl: { width: screenWidth * 0.98, maxHeight: screenHeight * 0.9 },
    full: { width: screenWidth, height: screenHeight }
  };

  const getContainerStyle = () => {
    switch (position) {
      case 'bottom':
        return { flex: 1, justifyContent: 'flex-end', alignItems: 'center' };
      case 'top':
        return { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 80 };
      default:
        return { flex: 1, justifyContent: 'center', alignItems: 'center' };
    }
  };

  const getModalStyle = () => {
    const baseStyle = {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    };

    if (position === 'bottom') {
      return { ...baseStyle, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 };
    }
    if (position === 'top') {
      return { ...baseStyle, borderTopLeftRadius: 0, borderTopRightRadius: 0 };
    }
    return baseStyle;
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      {...props}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={[{ backgroundColor: 'rgba(0,0,0,0.5)' }, getContainerStyle()]}>
          <TouchableWithoutFeedback>
            <View style={[sizeStyles[size], getModalStyle()]}>
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#111827',
                    flex: 1,
                  }}>
                    {title}
                  </Text>
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={{
                        padding: 4,
                        borderRadius: 20,
                        backgroundColor: '#F3F4F6',
                      }}
                    >
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <ContentWrapper
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
              >
                <View style={{ padding: 16 }}>
                  {children}
                </View>
              </ContentWrapper>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}) => {
  const confirmButtonColor = variant === 'danger' ? '#EF4444' : '#3B82F6';

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <View style={{ gap: 16 }}>
        <Text style={{
          color: '#374151',
          fontSize: 16,
          lineHeight: 24,
        }}>
          {message}
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: '#E5E7EB',
            }}
          >
            <Text style={{
              color: '#374151',
              fontWeight: '500',
            }}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              onConfirm();
              onClose();
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: confirmButtonColor,
            }}
          >
            <Text style={{
              color: '#FFFFFF',
              fontWeight: '500',
            }}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};