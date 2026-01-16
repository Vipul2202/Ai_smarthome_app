// ------------------------------------------------------------
// GLOBAL TYPE SYSTEM — SMART KITCHEN MANAGER 2025
// Single Source of Truth
// ------------------------------------------------------------

// ===============================
// INVENTORY CORE
// ===============================

// Inventory item status
export type InventoryStatus = "ok" | "low" | "expiring" | "expired";

// History Action Types (must match UI + engine)
export type HistoryAction =
  | "added"
  | "updated"
  | "bulk-added"
  | "consumed"
  | "moved"
  | "qty-increase"
  | "quick-added"
  | "qty-decrease";

// History Entry
export interface HistoryEntry {
  date: string;
  action: HistoryAction;
  qty: number;
  location: string;
  note?: string;
}

// Main Inventory Item model
export interface NormalizedItem {
  id: string;
  name: string;
  qty: number;
  unit: string;

  category: string;
  location: string;
  expiry: string;

  img: string;
  status: InventoryStatus;

  addedAt: number;

  lowThreshold?: number;
  notes?: string;
  tags?: string[];

  createdAt?: string;
  updatedAt?: string;

  history?: HistoryEntry[];

  heatScore?: number; // 0–100
  heatColor?: "green" | "yellow" | "orange" | "red";
}

// Sorting options
export type SortType = "expiry" | "qtyAsc" | "qtyDesc" | "recent" | "heat";

// ===============================
// SHOPPING LIST
// ===============================
export interface ShoppingListItem {
  id: string;
  name: string;
  qty?: string;
  checked: boolean;
  estimatedPrice?: number;
}

// ===============================
// EXPENSES
// ===============================
export interface Expense {
  id: string;
  type: "Ration" | "Food Order" | "Other" | string;
  amount: number;
  date: string;
  vendor?: string;
  notes?: string;
}

// ===============================
// REMINDERS
// ===============================
export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: "appliance" | "expiry" | "shopping" | "budget" | "custom";
  important?: boolean;
  description?: string;
}

// ===============================
// RECIPES
// ===============================
export interface Recipe {
  id: string;
  name: string;
  time: string;
  ingredients: number;
  available: boolean;
  cuisine: string;
  img: string;
  tags?: string[];
}

// ===============================
// DAILY LOGS
// ===============================
export interface DailyLog {
  id: string;
  date: string;
  cookedAtHome: string[];
  orderedFromOutside: string[];
  purchasedItems: string[];
  wastedItems: string[];
  notes?: string;
}

// ===============================
// HOUSEHOLDS / MEMBERS / SETTINGS
// ===============================
export interface Household {
  id: string;
  name: string;
  plan: "free" | "pro";
  kitchens: string[];
}

export interface Kitchen {
  id: string;
  name: string;
  location: string;
  isPrimary?: boolean;
}

export interface Member {
  id: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

export interface UserSettings {
  id: string;
  preferredTheme: "light" | "dark" | "system";
  language: "en" | "hi";
  defaultKitchenId: string;
  notificationsEmail: boolean;
  notificationsPush: boolean;
}

// ===============================
// FESTIVAL MODULE
// ===============================
export interface Festival {
  id: string;
  name: string;
  date: string;
  icon: string;
  color: string;
  description: string;
  tags: string[];
}

export interface FestivalTemplateItem {
  id: string;
  festivalId: string;
  name: string;
  qty?: string;
  category: string;
}

export interface SeasonalIngredient {
  id: string;
  name: string;
  season: "Winter" | "Summer" | "Monsoon";
  icon: string;
  uses: string[];
}

// ===============================
// CLEAN EXPORT BUNDLE (Optional)
// ===============================
export type {
  NormalizedItem as Item,
  HistoryEntry as ItemHistory,
  HistoryAction as ItemHistoryAction,
};


export interface SuggestedItem {
  name: string;
  qty: string;
  unit: string;
  location: string;
  expiry: string;
  category: string;
}