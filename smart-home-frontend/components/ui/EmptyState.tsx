import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  containerStyle?: ViewStyle;
  illustration?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'cube-outline',
  title,
  description,
  actionText,
  onAction,
  containerStyle,
  illustration
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 48,
    }, containerStyle]}>
      {illustration ? (
        <View style={{ marginBottom: 24 }}>{illustration}</View>
      ) : (
        <View style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: isDark ? '#374151' : '#F3F4F6',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <Ionicons 
            name={icon} 
            size={48} 
            color={isDark ? '#6B7280' : '#9CA3AF'} 
          />
        </View>
      )}
      
      <Text style={{
        fontSize: 20,
        fontWeight: '600',
        color: isDark ? '#FFFFFF' : '#111827',
        textAlign: 'center',
        marginBottom: 8,
      }}>
        {title}
      </Text>
      
      {description && (
        <Text style={{
          color: isDark ? '#9CA3AF' : '#6B7280',
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24,
          fontSize: 16,
        }}>
          {description}
        </Text>
      )}
      
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            backgroundColor: '#3B82F6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{
            color: '#FFFFFF',
            fontWeight: '500',
            fontSize: 16,
          }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Specific Empty States
export const EmptyInventory: React.FC<{ onAddItem?: () => void }> = ({ onAddItem }) => (
  <EmptyState
    icon="cube-outline"
    title="No Items Yet"
    description="Start building your inventory by adding your first item. You can scan barcodes, take photos, or add items manually."
    actionText="Add First Item"
    onAction={onAddItem}
  />
);

export const EmptyShoppingList: React.FC<{ onCreateList?: () => void }> = ({ onCreateList }) => (
  <EmptyState
    icon="list-outline"
    title="No Shopping Lists"
    description="Create your first shopping list to keep track of items you need to buy."
    actionText="Create List"
    onAction={onCreateList}
  />
);

export const EmptyRecipes: React.FC<{ onBrowseRecipes?: () => void }> = ({ onBrowseRecipes }) => (
  <EmptyState
    icon="restaurant-outline"
    title="No Recipes Found"
    description="Discover delicious recipes based on your inventory or browse our collection."
    actionText="Browse Recipes"
    onAction={onBrowseRecipes}
  />
);

export const EmptySearch: React.FC<{ searchQuery: string; onClearSearch?: () => void }> = ({ 
  searchQuery, 
  onClearSearch 
}) => (
  <EmptyState
    icon="search-outline"
    title="No Results Found"
    description={`No items found for "${searchQuery}". Try adjusting your search terms.`}
    actionText="Clear Search"
    onAction={onClearSearch}
  />
);

export const EmptyNotifications: React.FC = () => (
  <EmptyState
    icon="notifications-outline"
    title="No Notifications"
    description="You're all caught up! We'll notify you about expiring items and low stock."
  />
);

export const EmptyActivity: React.FC = () => (
  <EmptyState
    icon="time-outline"
    title="No Recent Activity"
    description="Your recent activities will appear here as you use the app."
  />
);