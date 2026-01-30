# Smart Home API Reference - Simple Guide

## 🔐 Authentication APIs

| API Name | Purpose | Frontend Location |
|----------|---------|-------------------|
| `register` | Create new user account | `app/(auth)/register.tsx` |
| `login` | User login | `app/(auth)/login.tsx` |
| `me` | Get current user info | `contexts/AuthContext.tsx` |
| `logout` | User logout | `hooks/useAuth.ts` |

---

## 📦 Inventory APIs

| API Name | Purpose | Frontend Location |
|----------|---------|-------------------|
| `createInventoryItem` | Add new product (prevents duplicates) | `hooks/useInventory.ts` → `app/inventory/add.tsx` |
| `inventoryItems` | Get all products | `hooks/useInventory.ts` → `app/(tabs)/inventory.tsx` |
| `updateInventoryItem` | Edit product details | `hooks/useInventory.ts` → `app/inventory/edit/[id].tsx` |
| `deleteInventoryItem` | Delete product | `hooks/useInventory.ts` → `app/(tabs)/inventory.tsx` |
| `searchInventoryFast` | Fast search with pagination | `hooks/useInventory.ts` → `app/(tabs)/inventory.tsx` (search bar) |

---

## 🎤 Voice & AI APIs

| API Name | Purpose | Frontend Location |
|----------|---------|-------------------|
| `processVoiceIntent` | Convert speech to action | `app/voice-control.tsx` |
| `updateInventoryByVoice` | Update products via voice | `app/voice-control.tsx` |
| `generateMissingInfoSpeech` | Create audio for missing info | `app/voice-control.tsx` |
| `generateSimpleSpeech` | Text to speech | `app/voice-control.tsx` |
| `categorizeProduct` | AI product categorization | `app/inventory/add.tsx` |

---

## 🔍 Search APIs

| API Name | Purpose | Frontend Location |
|----------|---------|-------------------|
| `searchInventoryByVoice` | Voice search products | `app/voice-control.tsx` + `app/(tabs)/inventory.tsx` |

---

## 🏠 House & Kitchen APIs

| API Name | Purpose | Frontend Location |
|----------|---------|-------------------|
| `households` | Get user's houses/kitchens | `hooks/useInventory.ts` |
| `createHouse` | Create new house | `app/houses/create.tsx` |
| `createHousehold` | Create household | `hooks/useInventory.ts` (auto-created) |
| `createKitchen` | Create kitchen | `hooks/useInventory.ts` (auto-created) |

---

## 🛒 Shopping APIs

| API Name | Purpose | Frontend Location |
|----------|---------|-------------------|
| `shoppingLists` | Get shopping lists | `hooks/useShopping.ts` → `app/(tabs)/shopping.tsx` |
| `createShoppingList` | Create shopping list | `hooks/useShopping.ts` |
| `createShoppingListItem` | Add item to list | `hooks/useShopping.ts` |

---

## 🎵 Text-to-Speech Info

**Backend**: Uses **OpenAI TTS API** (not npm)
**Frontend**: Uses **expo-av** npm package to play audio
**Voice Recognition**: Uses **OpenAI Whisper API**

---

## 📱 Quick Frontend File Guide

| File | What it does |
|------|-------------|
| `hooks/useInventory.ts` | Main inventory functions (add, edit, delete, search) |
| `hooks/useAuth.ts` | Login/logout functions |
| `hooks/useShopping.ts` | Shopping list functions |
| `app/voice-control.tsx` | Voice commands and AI |
| `app/(tabs)/inventory.tsx` | Main inventory screen |
| `app/inventory/add.tsx` | Add new products |
| `contexts/AuthContext.tsx` | User authentication state |

---

## 🚀 Key Features

- **Duplicate Prevention**: `createInventoryItem` checks if product exists and updates quantity
- **Fast Search**: `searchInventoryFast` with 300ms debounce and pagination
- **Voice Control**: Complete voice-to-action pipeline with AI
- **Auto-Setup**: Creates household and kitchen automatically on first use