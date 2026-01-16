# 🏠 AI Smart Home Inventory Manager

A comprehensive smart home inventory management system with AI-powered voice control, built with React Native (Expo) and Node.js/GraphQL backend.

## 🌟 Features

### ✅ Completed Features

#### 🎤 Voice Control System
- Real-time voice command processing with OpenAI integration
- Natural language understanding for inventory management
- Support for commands like "Add 2 bottles of milk" or "Check tomatoes"
- Beautiful UI with microphone states (Purple=idle, Green=listening, Orange=processing)
- Text input fallback option
- Colorful success modals with action buttons

#### 🏠 House Selection Flow
- Multi-house support for users
- Create and manage multiple houses
- Select active house from dashboard
- Automatic house creation for new users
- Smart splash screen routing based on user state

#### 📦 Inventory Management
- Complete CRUD operations for inventory items
- Real-time backend integration with GraphQL
- 3-tab organization system:
  - **All Items**: View all inventory with counts
  - **Categories**: Dropdown with 8 categories (Fruits, Vegetables, Dairy, Meat, Grains, Beverages, Snacks, Other)
  - **Uncategorized**: Items without assigned categories
- View, Edit, and Delete functionality for each item
- Professional search with clear button
- Category-based filtering
- Auto-creation of household and kitchen for new users

#### 🎨 UI/UX Features
- Beautiful gradient designs
- Dark/Light theme support
- Smooth animations and transitions
- Professional card layouts
- Color-coded buttons (Purple=view, Blue=edit, Red=delete)
- Responsive design for all screen sizes

## 🚀 Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **GraphQL Client**: Apollo Client
- **UI Components**: Custom components with Ionicons
- **Styling**: Inline styles with theme support
- **Storage**: AsyncStorage for local data

### Backend (API Server)
- **Runtime**: Node.js with TypeScript
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **AI Integration**: OpenAI API for voice processing
- **File Storage**: Cloud storage integration

## 📁 Project Structure

```
smart-home-manager/
├── smart-home/                 # Backend (Node.js + GraphQL)
│   ├── src/
│   │   ├── graphql/
│   │   │   ├── resolvers/     # GraphQL resolvers
│   │   │   ├── schema.ts      # GraphQL schema
│   │   │   └── context.ts     # GraphQL context
│   │   ├── services/          # Business logic
│   │   │   ├── voice.ts       # Voice command processing
│   │   │   ├── ai.ts          # OpenAI integration
│   │   │   └── storage.ts     # File storage
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
│
└── smart-home-frontend/        # Frontend (React Native + Expo)
    ├── app/
    │   ├── (tabs)/            # Tab navigation screens
    │   │   ├── index.tsx      # Dashboard
    │   │   ├── inventory.tsx  # Inventory management
    │   │   └── shopping.tsx   # Shopping lists
    │   ├── (auth)/            # Authentication screens
    │   ├── select-house.tsx   # House selection
    │   ├── create-house.tsx   # House creation
    │   └── voice-control.tsx  # Voice control interface
    ├── components/
    │   ├── ui/                # Reusable UI components
    │   └── SplashScreen.tsx   # Animated splash screen
    ├── hooks/                 # Custom React hooks
    │   ├── useInventory.ts    # Inventory management
    │   └── useAuth.ts         # Authentication
    ├── providers/             # Context providers
    │   ├── AuthProvider.tsx   # Auth context
    │   └── ThemeProvider.tsx  # Theme context
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key
- Expo CLI
- Android/iOS device or emulator

### Backend Setup

1. Navigate to backend directory:
```bash
cd smart-home
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smarthome"
DIRECT_URL="postgresql://user:password@localhost:5432/smarthome"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-api-key"
PORT=4000
```

4. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the server:
```bash
npm start
```

Backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd smart-home-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:4000
```

4. Start Expo:
```bash
npx expo start
```

5. Scan QR code with Expo Go app or press:
   - `a` for Android emulator
   - `i` for iOS simulator

## 📱 User Flow

### New User Journey
1. **Splash Screen** → Animated loading (4 seconds)
2. **Create House** → Enter house name and description
3. **Dashboard** → View house name at top, access all features

### Existing User Journey
1. **Splash Screen** → Checks for houses
2. **Select House** → Choose from existing houses
3. **Dashboard** → Continue with selected house

### Switching Houses
1. Click house name card on dashboard
2. Select different house from list
3. Dashboard updates with new house name

## 🎯 Key Features Explained

### Voice Control
- Tap microphone button to start listening
- Speak naturally: "Add 2 bottles of milk to the fridge"
- AI processes command and extracts:
  - Item name (normalized)
  - Quantity
  - Unit
  - Category
  - Location
- Review extracted data in beautiful UI
- Confirm to add to inventory

### Inventory Management
- **All Items Tab**: Browse complete inventory
- **Categories Tab**: Dropdown with category counts
- **Uncategorized Tab**: Items needing categorization
- **Search**: Real-time filtering by name
- **View**: See detailed product information
- **Edit**: Update item details
- **Delete**: Remove items with confirmation

### House Management
- Create multiple houses (e.g., "Main Home", "Beach House")
- Switch between houses anytime
- Each house has its own inventory
- House name displayed prominently on dashboard

## 🔐 Authentication

- JWT-based authentication
- Secure token storage in AsyncStorage
- Auto-login on app restart
- Protected routes with auth checks

## 🗄️ Database Schema

Key models:
- **User**: User accounts with authentication
- **House**: User's houses
- **Household**: Household management
- **Kitchen**: Kitchen within household
- **InventoryItem**: Inventory items
- **InventoryBatch**: Item batches with expiry
- **ShoppingList**: Shopping lists
- **Expense**: Expense tracking

## 🚀 Deployment

### Backend Deployment (Render.com)
1. Push code to GitHub
2. Connect Render to repository
3. Set environment variables
4. Deploy as Web Service

### Frontend Deployment
1. Build APK: `npm run build:apk`
2. Or publish to Expo: `expo publish`
3. Or build for stores: `eas build`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Vipul**
- GitHub: [@Vipul2202](https://github.com/Vipul2202)

## 🙏 Acknowledgments

- OpenAI for voice processing
- Expo team for amazing mobile framework
- Prisma for database ORM
- Apollo for GraphQL implementation

## 📞 Support

For support, email: support@smarthome.com or open an issue on GitHub.

---

Made with ❤️ by Vipul
