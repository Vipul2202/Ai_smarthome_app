# 🏠 Smart Home React Native App - Complete Setup Guide

This guide will help you set up and run the complete Smart Home React Native app with full backend integration.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **npm 9+** or **yarn**
- **Expo CLI** (will be installed automatically)
- **iOS Simulator** (for iOS development on Mac)
- **Android Studio** and **Android Emulator** (for Android development)
- **Smart Home Backend** running (see backend setup)

## 🚀 Quick Setup

### 1. Clone and Install

```bash
# Navigate to the frontend directory
cd smart-home-frontend

# Install dependencies (this will run setup automatically)
npm install

# Or run setup manually
npm run setup
```

### 2. Configure Environment

The `.env` file is already configured to work with your Smart Home backend:

```env
# These URLs match your backend configuration
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
EXPO_PUBLIC_UPLOAD_URL=http://localhost:4000/upload
```

**Important for Physical Device Testing:**
If you're testing on a physical device (not simulator), you need to replace `localhost` with your computer's IP address:

1. **Find your computer's IP address:**
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`

2. **Update .env file:**
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:4000
   EXPO_PUBLIC_GRAPHQL_URL=http://YOUR_IP_ADDRESS:4000/graphql
   EXPO_PUBLIC_UPLOAD_URL=http://YOUR_IP_ADDRESS:4000/upload
   ```

3. **Example:**
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:4000
   EXPO_PUBLIC_GRAPHQL_URL=http://192.168.1.100:4000/graphql
   EXPO_PUBLIC_UPLOAD_URL=http://192.168.1.100:4000/upload
   ```

### 3. Start Development Server

```bash
# Start the Expo development server
npm start

# Or start with specific platform
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Web browser (for testing)
```

## 🔧 Backend Integration

### Required Backend APIs

The app expects these GraphQL endpoints to be available:

#### Authentication
- `login(email: String!, password: String!)`
- `register(name: String!, email: String!, password: String!)`
- `forgotPassword(email: String!)`
- `me` query for user data

#### Inventory Management
- `inventoryItems(kitchenId: ID!)`
- `addInventoryItem(input: AddInventoryItemInput!)`
- `updateInventoryItem(id: ID!, input: UpdateInventoryItemInput!)`
- `deleteInventoryItem(id: ID!)`

#### Shopping Lists
- `shoppingLists(householdId: ID!)`
- `createShoppingList(input: CreateShoppingListInput!)`
- `addShoppingItem(listId: ID!, input: AddShoppingItemInput!)`

#### Recipes
- `recipes(userId: ID!)`
- `generateRecipe(input: GenerateRecipeInput!)`
- `saveRecipe(input: SaveRecipeInput!)`

#### Households
- `household(userId: ID!)`
- `createHousehold(input: CreateHouseholdInput!)`
- `createKitchen(input: CreateKitchenInput!)`

### Backend Setup

1. **Ensure your Smart Home backend is running**
   ```bash
   # In your smart-home directory
   cd smart-home
   npm run dev  # or npm start
   ```

2. **Verify GraphQL endpoint is accessible** at `http://localhost:4000/graphql`

3. **Check CORS configuration** - Your backend should already be configured to allow requests from `http://localhost:3000` (Next.js) and Expo development server

4. **Test API endpoints** using GraphQL playground at `http://localhost:4000/graphql`

**Backend Requirements:**
- ✅ GraphQL server running on port 4000
- ✅ Database connected (PostgreSQL with Supabase)
- ✅ JWT authentication configured
- ✅ CORS enabled for development
- ✅ All GraphQL resolvers implemented

## 📱 Platform-Specific Setup

### iOS Development

1. **Install Xcode** (Mac only)
2. **Install iOS Simulator**
3. **Run the app:**
   ```bash
   npm run ios
   ```

### Android Development

1. **Install Android Studio**
2. **Set up Android Emulator**
3. **Configure environment variables:**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. **Run the app:**
   ```bash
   npm run android
   ```

## 🔐 Authentication Flow

The app includes complete authentication:

### Login Screen
- Email/password validation
- Error handling
- Automatic redirect after login

### Register Screen
- Form validation
- Password confirmation
- Account creation

### Forgot Password
- Email validation
- Password reset flow
- Success confirmation

### Authentication State
- JWT token storage
- Automatic login persistence
- Secure token management

## 🎨 Features Included

### ✅ Complete UI Components
- Custom Button component
- Input component with validation
- Card components
- Loading spinners
- Empty states
- Badge components

### ✅ Navigation
- Expo Router setup
- Tab navigation
- Auth flow navigation
- Modal screens

### ✅ State Management
- Apollo Client for GraphQL
- AsyncStorage for persistence
- Zustand for local state
- Context providers

### ✅ Native Features
- Camera integration
- Barcode scanning
- Push notifications
- Secure storage
- Image picker

## 🛠️ Development Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run type-check    # TypeScript checking

# Building
npm run build:android # Build Android APK/AAB
npm run build:ios     # Build iOS IPA
npm run build:all     # Build for all platforms

# Utilities
npm run clean         # Clean node_modules and .expo
npm run setup         # Run setup script
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Metro bundler issues
```bash
# Clear Metro cache
npx expo start --clear

# Or clean and reinstall
npm run clean
npm install
```

#### 2. Backend connection issues
- Check if backend is running on correct port
- Verify CORS configuration
- Update API URLs in `.env`
- Test GraphQL endpoint manually

#### 3. Authentication not working
- Check JWT token format
- Verify GraphQL mutations match backend
- Check AsyncStorage permissions

#### 4. Build issues
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Clear Expo cache
npx expo install --fix
```

### Network Configuration

For development with physical devices:

1. **Find your computer's IP address**
2. **Update .env file:**
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:4000
   EXPO_PUBLIC_GRAPHQL_URL=http://YOUR_IP_ADDRESS:4000/graphql
   ```
3. **Ensure backend accepts connections from your IP**

## 📦 Production Deployment

### 1. Configure EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for production
eas build --platform all
```

### 2. Update Environment Variables

Create production environment configuration:

```env
EXPO_PUBLIC_API_URL=https://your-production-api.com
EXPO_PUBLIC_GRAPHQL_URL=https://your-production-api.com/graphql
EXPO_PUBLIC_UPLOAD_URL=https://your-production-api.com/upload
```

### 3. Submit to App Stores

```bash
# Submit to app stores
eas submit --platform all
```

## 🎯 Testing the App

### 1. Authentication Testing
- Try login with valid credentials
- Test registration flow
- Verify forgot password

### 2. API Integration Testing
- Check GraphQL queries work
- Verify data persistence
- Test error handling

### 3. Navigation Testing
- Test tab navigation
- Verify auth redirects
- Check modal screens

## 📞 Support

If you encounter issues:

1. **Check the logs** in Expo Dev Tools
2. **Verify backend connectivity**
3. **Review GraphQL schema compatibility**
4. **Check device/simulator setup**

## 🎉 Success!

Once setup is complete, you should have:

- ✅ Fully functional React Native app
- ✅ Complete authentication system
- ✅ Backend API integration
- ✅ All screens and navigation working
- ✅ Native features enabled
- ✅ Production-ready build system

The app is now ready for development and can be deployed to both iOS and Android app stores!