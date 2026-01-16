export * from './Colors';
export * from './Layout';

// App constants
export const APP_CONFIG = {
  name: 'Smart Home',
  version: '1.0.0',
  description: 'Your Intelligent Inventory Assistant',
  website: 'https://smarthome.app',
  supportEmail: 'support@smarthome.app',
  privacyPolicyUrl: 'https://smarthome.app/privacy',
  termsOfServiceUrl: 'https://smarthome.app/terms',
};

// API constants
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Storage constants
export const CACHE_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 50 * 1024 * 1024, // 50MB
};

// Notification constants
export const NOTIFICATION_CONFIG = {
  expiryWarningDays: 3,
  lowStockThreshold: 2,
  maxNotifications: 100,
};

// Inventory constants
export const INVENTORY_CONFIG = {
  categories: [
    'Dairy',
    'Meat',
    'Vegetables',
    'Fruits',
    'Pantry',
    'Frozen',
    'Beverages',
    'Snacks',
    'Condiments',
    'Spices',
    'Cleaning',
    'Personal Care',
    'Other',
  ],
  units: [
    'piece',
    'pieces',
    'kg',
    'g',
    'lb',
    'oz',
    'liter',
    'ml',
    'cup',
    'tbsp',
    'tsp',
    'bottle',
    'can',
    'box',
    'bag',
    'pack',
  ],
  storageLocations: [
    'Refrigerator',
    'Freezer',
    'Pantry',
    'Cabinet',
    'Counter',
    'Basement',
    'Garage',
    'Other',
  ],
};

// Recipe constants
export const RECIPE_CONFIG = {
  difficulties: ['Easy', 'Medium', 'Hard'],
  cuisines: [
    'American',
    'Italian',
    'Mexican',
    'Chinese',
    'Indian',
    'Japanese',
    'French',
    'Thai',
    'Mediterranean',
    'Middle Eastern',
    'Korean',
    'Vietnamese',
    'Other',
  ],
  mealTypes: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'],
  dietaryRestrictions: [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Low-Carb',
    'Keto',
    'Paleo',
    'Halal',
    'Kosher',
  ],
};

// Shopping constants
export const SHOPPING_CONFIG = {
  listColors: [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ],
  priorities: ['Low', 'Medium', 'High', 'Urgent'],
};

// Date/Time constants
export const DATE_CONFIG = {
  formats: {
    short: 'MMM d',
    medium: 'MMM d, yyyy',
    long: 'MMMM d, yyyy',
    time: 'h:mm a',
    datetime: 'MMM d, yyyy h:mm a',
  },
  timezones: [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ],
};

// Feature flags
export const FEATURES = {
  voiceCommands: true,
  barcodeScanning: true,
  receiptOCR: true,
  aiRecipeGeneration: true,
  mealPlanning: true,
  expenseTracking: true,
  householdSharing: true,
  pushNotifications: true,
  darkMode: true,
  offlineMode: false, // Coming soon
  analytics: false, // Disabled by default
};

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network connection error. Please check your internet connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  camera: 'Camera permission is required for this feature.',
  storage: 'Storage permission is required for this feature.',
  unknown: 'An unexpected error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  itemAdded: 'Item added successfully!',
  itemUpdated: 'Item updated successfully!',
  itemDeleted: 'Item deleted successfully!',
  listCreated: 'Shopping list created successfully!',
  listUpdated: 'Shopping list updated successfully!',
  recipeGenerated: 'Recipe generated successfully!',
  recipeSaved: 'Recipe saved successfully!',
  profileUpdated: 'Profile updated successfully!',
  settingsSaved: 'Settings saved successfully!',
};

// Validation rules
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  itemName: {
    minLength: 1,
    maxLength: 100,
  },
  quantity: {
    min: 0,
    max: 9999,
  },
};