# Smart Kitchen Manager - Frontend

A modern, responsive web application for managing kitchen inventory, meal planning, expense tracking, and more. Built with Next.js, React, and TypeScript.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Backend API running (see backend directory)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Application: http://localhost:3000

## 🔧 Environment Configuration

The `.env.local` file is already configured with:

- **API Configuration**: Backend GraphQL and upload endpoints
- **App Configuration**: Site URLs and branding
- **Optional**: Analytics and tracking (commented out)

## ✨ Features

- 🏠 **Dashboard** - Comprehensive overview of kitchen activities
- 📦 **Inventory Management** - Track items, expiry dates, and stock levels
- 🛒 **Shopping Lists** - Create and manage smart shopping lists
- 💰 **Expense Tracking** - Monitor grocery expenses with receipt scanning
- 🍽️ **Meal Planning** - Plan meals and discover AI-generated recipes
- 📊 **Analytics** - Insights into spending, waste, and nutrition
- 🔔 **Notifications** - Smart alerts for expiry, low stock, and reminders
- 📱 **PWA Support** - Install as a mobile app
- 🌙 **Dark Mode** - Beautiful dark and light themes
- 📱 **Responsive Design** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **State Management**: Zustand + Apollo Client
- **GraphQL Client**: Apollo Client
- **Animations**: Framer Motion
- **PWA**: Next PWA
- **Icons**: Lucide React

## 📚 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint + Next.js lint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking

# Analysis
npm run analyze      # Bundle size analysis
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # Dashboard pages
│   ├── login/          # Authentication pages
│   ├── register/       # Registration pages
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components (Radix + Custom)
│   ├── providers/     # Context providers
│   └── theme-provider.tsx
├── hooks/             # Custom React hooks
│   ├── use-auth.ts    # Authentication hook
│   ├── use-inventory.ts # Inventory management
│   ├── use-recipes.ts # Recipe management
│   └── ...
├── lib/               # Utility libraries
│   ├── apollo-client.ts # GraphQL client setup
│   ├── graphql/       # GraphQL queries and mutations
│   ├── utils.ts       # Utility functions
│   └── ...
└── styles/            # Global styles
    └── globals.css    # Tailwind CSS imports
```

## 🎨 Key Features

### Dashboard
- Real-time overview of inventory status
- Quick actions for common tasks
- Recent activity feed
- Smart notifications

### Inventory Management
- Add items with barcode scanning
- Track expiry dates and stock levels
- Batch management for bulk items
- Smart categorization and search

### Shopping Lists
- AI-powered shopping suggestions
- Multiple list types (daily, weekly, festival)
- Price tracking and budget management
- Shared lists for households

### Meal Planning
- AI recipe generation based on available ingredients
- Weekly meal planning calendar
- Nutrition tracking and goals
- Recipe favorites and history

### Expense Tracking
- Receipt OCR processing
- Category-wise expense analysis
- Budget tracking and alerts
- Vendor and price comparison

### Analytics & Reports
- Spending patterns and trends
- Waste tracking and reduction tips
- Nutrition insights
- Inventory turnover analysis

## 🔌 GraphQL Integration

The app uses Apollo Client for GraphQL operations:

### Queries
```typescript
import { useQuery } from '@apollo/client';
import { GET_INVENTORY } from '@/lib/graphql/queries';

const { data, loading, error } = useQuery(GET_INVENTORY, {
  variables: { kitchenId }
});
```

### Mutations
```typescript
import { useMutation } from '@apollo/client';
import { ADD_INVENTORY_ITEM } from '@/lib/graphql/mutations';

const [addItem] = useMutation(ADD_INVENTORY_ITEM, {
  refetchQueries: [{ query: GET_INVENTORY }]
});
```

### Custom Hooks
```typescript
import { useInventory } from '@/hooks/use-inventory';

const { items, loading, addItem, updateItem } = useInventory(kitchenId);
```

## 📱 PWA Features

The app includes Progressive Web App capabilities:

- **Offline Support**: Basic offline functionality
- **Install Prompt**: Native app-like installation
- **Push Notifications**: Real-time notifications (when supported)
- **Background Sync**: Sync data when connection is restored

## 📱 Responsive Design

The app is fully responsive with:

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Enhanced layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Optimized for touch interactions

## ⚡ Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Lazy Loading**: Components and routes
- **Caching**: Apollo Client caching strategy

## ♿ Accessibility

- **WCAG 2.1 AA**: Compliance with accessibility standards
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Color Contrast**: High contrast ratios
- **Focus Management**: Proper focus handling

## 🎨 Styling Guidelines

- Use Tailwind CSS for styling
- Follow the design system defined in `tailwind.config.ts`
- Use CSS variables for theme colors
- Responsive design with mobile-first approach

## 🔄 State Management

- **Global State**: Zustand for app-wide state
- **Server State**: Apollo Client for GraphQL data
- **Local State**: React hooks for component state
- **Form State**: React Hook Form for complex forms

## 🌐 Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

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
- Check the component documentation
- Review the GraphQL schema in the backend# smart-kitchen-frontend
