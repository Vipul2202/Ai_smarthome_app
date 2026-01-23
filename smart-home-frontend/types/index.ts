// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string; // Added location property
  expiryDate?: string;
  status: 'good' | 'warning' | 'critical';
  barcode?: string;
  notes?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

// Shopping List Types
export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  completed: number;
  total: number;
  color: string;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  completed: boolean;
  price?: number;
  category?: string;
}

// Recipe Types
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine?: string;
  rating?: number;
  image?: string;
  nutrition?: NutritionInfo;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Household Types
export interface Household {
  id: string;
  name: string;
  members: User[];
  kitchens: Kitchen[];
  createdAt: string;
  updatedAt: string;
}

export interface Kitchen {
  id: string;
  name: string;
  householdId: string;
  inventoryItems: InventoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  modal: undefined;
};

export type TabParamList = {
  index: undefined;
  inventory: undefined;
  shopping: undefined;
  recipes: undefined;
  profile: undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
};

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}

// Storage Types
export interface StorageKeys {
  AUTH_TOKEN: 'authToken';
  USER_DATA: 'userData';
  THEME: 'theme';
  ONBOARDING_COMPLETED: 'onboardingCompleted';
  NOTIFICATION_SETTINGS: 'notificationSettings';
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

// Camera Types
export interface CameraResult {
  uri: string;
  type: 'image' | 'video';
  width: number;
  height: number;
}

// Barcode Types
export interface BarcodeResult {
  data: string;
  type: string;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

// Voice Types
export interface VoiceCommand {
  command: string;
  confidence: number;
  transcript: string;
}