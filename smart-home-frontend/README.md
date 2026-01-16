# Smart Home - React Native App

A complete React Native mobile application for managing home inventory, meal planning, expense tracking, and more. Built with Expo, React Native, and TypeScript.

## ✅ Complete App Features

This is a **COMPLETE** React Native app with all functionality implemented:

### 🏠 **Core Features**
- ✅ Custom animated splash screen
- ✅ Complete authentication flow (Login/Register/Forgot Password)
- ✅ Dashboard with real-time stats and quick actions
- ✅ Full inventory management with categories and search
- ✅ Shopping lists with AI suggestions
- ✅ Recipe management with AI generation
- ✅ User profile and settings
- ✅ Dark/Light theme support
- ✅ Push notifications
- ✅ Camera integration for barcode scanning
- ✅ GraphQL integration with Apollo Client
- ✅ Offline storage and caching
- ✅ Error handling and loading states

### 📱 **Native Features**
- ✅ Camera and photo picker
- ✅ Barcode scanner with product lookup
- ✅ Push notifications with Expo
- ✅ Secure storage for sensitive data
- ✅ Haptic feedback
- ✅ Status bar management
- ✅ Safe area handling
- ✅ Gesture handling

### 🎨 **UI/UX**
- ✅ Beautiful NativeWind (Tailwind) styling
- ✅ Consistent design system
- ✅ Responsive layouts for all screen sizes
- ✅ Smooth animations and transitions
- ✅ Loading states and empty states
- ✅ Error boundaries and fallbacks

### 🔧 **Technical Implementation**
- ✅ TypeScript throughout
- ✅ Custom hooks for all features
- ✅ GraphQL queries and mutations
- ✅ State management with Zustand + Apollo
- ✅ Proper error handling
- ✅ Form validation
- ✅ Image optimization
- ✅ Performance optimizations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)
- **Smart Home Backend running** (see smart-home directory)

### Setup Instructions

1. **Start the Backend First**
   ```bash
   # In the smart-home directory (backend)
   cd smart-home
   npm run dev
   ```
   Backend will run on `http://localhost:4000`

2. **Install Frontend Dependencies**
   ```bash
   # In the smart-home-frontend directory
   cd smart-home-frontend
   npm install
   ```

3. **Configure Environment**
   The `.env` file is already configured for your backend:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:4000
   EXPO_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Run on Device/Simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web (for testing)
   npm run web
   ```

## 📱 Features

- 🏠 **Dashboard** - Comprehensive overview of home activities
- 📦 **Inventory Management** - Track items, expiry dates, and stock levels
- 🛒 **Shopping Lists** - Create and manage smart shopping lists
- 💰 **Expense Tracking** - Monitor grocery expenses with receipt scanning
- 🍽️ **Meal Planning** - Plan meals and discover AI-generated recipes
- 📊 **Analytics** - Insights into spending, waste, and nutrition
- 🔔 **Notifications** - Smart alerts for expiry, low stock, and reminders
- 🌙 **Dark Mode** - Beautiful dark and light themes
- 📱 **Native Features** - Camera, barcode scanning, voice commands

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand + Apollo Client
- **GraphQL Client**: Apollo Client
- **Storage**: AsyncStorage + Expo SecureStore
- **UI Components**: Custom components with Expo Vector Icons
- **Animations**: React Native Reanimated
- **Camera**: Expo Camera + Image Picker
- **Notifications**: Expo Notifications

## 📚 Development Commands

```bash
# Development
npm start              # Start Expo development server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm run web           # Run on web browser

# Building
npm run build:android # Build Android APK/AAB
npm run build:ios     # Build iOS IPA
npm run build:all     # Build for all platforms

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run type-check    # TypeScript type checking

# Testing
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
```

## 📁 Project Structure

```
app/
├── (auth)/              # Authentication screens
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── (tabs)/              # Main app tabs
│   ├── index.tsx        # Dashboard
│   ├── inventory.tsx    # Inventory management
│   ├── shopping.tsx     # Shopping lists
│   ├── recipes.tsx      # Recipes and meal planning
│   └── profile.tsx      # User profile
├── _layout.tsx          # Root layout
└── index.tsx           # App entry point

components/
├── SplashScreen.tsx     # Custom splash screen
└── ui/                 # Reusable UI components

hooks/
├── useAuth.ts          # Authentication hook
└── ...                 # Other custom hooks

lib/
├── apollo-client.ts    # GraphQL client setup
├── graphql/           # GraphQL queries and mutations
└── ...                # Utility libraries

providers/
├── AuthProvider.tsx    # Authentication context
└── ThemeProvider.tsx   # Theme context
```

## 🎨 Key Features

### Splash Screen
- Beautiful animated splash screen with app branding
- Smooth transitions and loading indicators
- Custom animations using React Native Animated API

### Authentication
- Login/Register with email and password
- Forgot password functionality
- JWT token-based authentication
- Secure token storage with AsyncStorage

### Dashboard
- Real-time overview of inventory status
- Quick actions for common tasks
- Recent activity feed
- AI-powered suggestions and tips

### Inventory Management
- Add items with barcode scanning
- Track expiry dates and stock levels
- Category-based filtering and search
- Visual status indicators for item conditions

### Shopping Lists
- Multiple shopping lists support
- AI-powered shopping suggestions
- Progress tracking and completion status
- Quick actions for adding items

### Recipes & Meal Planning
- AI recipe generation based on available ingredients
- Featured and quick recipe collections
- Category-based recipe browsing
- Integration with inventory for ingredient availability

### Profile & Settings
- User profile management
- App preferences and settings
- Dark/light theme toggle
- Data export and privacy controls

## 🔌 GraphQL Integration

The app uses Apollo Client for GraphQL operations with the backend API:

### Authentication
```typescript
const { data } = await loginMutation({
  variables: { email, password }
});
```

### Data Fetching
```typescript
const { data, loading, error } = useQuery(GET_INVENTORY, {
  variables: { kitchenId }
});
```

### Mutations
```typescript
const [addItem] = useMutation(ADD_INVENTORY_ITEM, {
  refetchQueries: [{ query: GET_INVENTORY }]
});
```

## 📱 Native Features

### Camera & Barcode Scanning
- Expo Camera for taking photos
- Barcode scanning for adding items
- Image picker for selecting photos from gallery

### Notifications
- Push notifications for expiry alerts
- Local notifications for reminders
- Notification preferences management

### Storage
- AsyncStorage for app preferences
- Secure storage for sensitive data
- Offline data caching

## 🎨 Styling with NativeWind

The app uses NativeWind (Tailwind CSS for React Native) for styling:

```tsx
<View className="flex-1 bg-gray-50 dark:bg-gray-900">
  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
    Welcome
  </Text>
</View>
```

### Theme Support
- Automatic dark/light mode detection
- Manual theme switching
- Consistent color scheme across the app

## 🔄 State Management

- **Global State**: Zustand for app-wide state
- **Server State**: Apollo Client for GraphQL data
- **Local State**: React hooks for component state
- **Authentication**: Context API with custom hooks

## 📱 Platform Support

- **iOS**: iOS 13.0+
- **Android**: Android 6.0+ (API level 23)
- **Web**: Modern browsers (for development/testing)

## 🚀 Deployment

### Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for development
eas build --profile development --platform all
```

### Production Build
```bash
# Build for production
eas build --profile production --platform all

# Submit to app stores
eas submit --platform all
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url
EXPO_PUBLIC_GRAPHQL_URL=http://your-backend-url/graphql
```

### App Configuration
Update `app.json` for:
- App name and bundle identifier
- Permissions and capabilities
- Build configurations
- Store metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and type checking
6. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Expo documentation
- Review the React Native documentation