import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/types';

const CATEGORIES = [
  { id: 'fruits', label: 'Fruits', icon: 'leaf', color: '#10B981' },
  { id: 'vegetables', label: 'Vegetables', icon: 'nutrition', color: '#059669' },
  { id: 'dairy', label: 'Dairy', icon: 'water', color: '#3B82F6' },
  { id: 'meat', label: 'Meat', icon: 'restaurant', color: '#EF4444' },
  { id: 'grains', label: 'Grains', icon: 'ellipse', color: '#F59E0B' },
  { id: 'beverages', label: 'Beverages', icon: 'wine', color: '#8B5CF6' },
  { id: 'snacks', label: 'Snacks', icon: 'fast-food', color: '#EC4899' },
  { id: 'other', label: 'Other', icon: 'cube', color: '#6B7280' },
];

export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'categories' | 'uncategorized'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editUnit, setEditUnit] = useState('');
