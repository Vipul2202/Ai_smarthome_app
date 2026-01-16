import { gql } from '@apollo/client';

// Auth Queries
export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      avatar
      phone
      location
      settings {
        id
        notifications {
          lowStock
          expiry
          shopping
          mealPlan
          push
          email
          sms
        }
        privacy {
          profileVisibility
          dataSharing
          analyticsOptOut
        }
      }
      preferences {
        theme
        language
        currency
        timezone
        dateFormat
      }
      households {
        id
        household {
          id
          name
          description
          inviteCode
        }
        role
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      name
      email
      avatar
    }
  }
`;

// Household & Kitchen Queries
export const GET_HOUSEHOLDS = gql`
  query GetHouseholds {
    households {
      id
      household {
        id
        name
        description
        inviteCode
        kitchens {
          id
          name
        }
      }
      role
    }
  }
`;

export const GET_KITCHENS = gql`
  query GetKitchens($householdId: ID!) {
    kitchens(householdId: $householdId) {
      id
      name
      description
    }
  }
`;

// Inventory Queries
export const GET_INVENTORY_ITEMS = gql`
  query GetInventoryItems($kitchenId: ID!) {
    inventoryItems(kitchenId: $kitchenId) {
      id
      name
      category
      quantity
      unit
      expiryDate
      barcode
      image
      batches {
        id
        quantity
        expiryDate
        purchaseDate
        price
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_LOW_STOCK_ITEMS = gql`
  query GetLowStockItems($kitchenId: ID!) {
    lowStockItems(kitchenId: $kitchenId) {
      id
      name
      category
      quantity
      unit
      minQuantity
    }
  }
`;

export const GET_EXPIRING_ITEMS = gql`
  query GetExpiringItems($kitchenId: ID!, $days: Int = 7) {
    expiringItems(kitchenId: $kitchenId, days: $days) {
      id
      name
      category
      quantity
      unit
      expiryDate
      daysUntilExpiry
    }
  }
`;

// Shopping Queries
export const GET_SHOPPING_LISTS = gql`
  query GetShoppingLists($kitchenId: ID!) {
    shoppingLists(kitchenId: $kitchenId) {
      id
      name
      type
      items {
        id
        name
        quantity
        unit
        completed
        price
        category
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHOPPING_LIST = gql`
  query GetShoppingList($id: ID!) {
    shoppingList(id: $id) {
      id
      name
      type
      items {
        id
        name
        quantity
        unit
        completed
        price
        category
        notes
      }
      createdAt
      updatedAt
    }
  }
`;

// Recipe Queries
export const GET_RECIPE_HISTORY = gql`
  query GetRecipeHistory($kitchenId: ID!) {
    recipeHistory(kitchenId: $kitchenId) {
      id
      title
      description
      ingredients
      instructions
      prepTime
      cookTime
      servings
      difficulty
      cuisine
      rating
      image
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
      isFavorite
      createdAt
    }
  }
`;

export const GENERATE_RECIPE = gql`
  query GenerateRecipe($input: GenerateRecipeInput!) {
    generateRecipe(input: $input) {
      id
      title
      description
      ingredients
      instructions
      prepTime
      cookTime
      servings
      difficulty
      cuisine
      nutrition {
        calories
        protein
        carbs
        fat
        fiber
        sugar
      }
    }
  }
`;

// Meal Planning Queries
export const GET_MEAL_PLANS = gql`
  query GetMealPlans($kitchenId: ID!, $startDate: String!, $endDate: String!) {
    mealPlans(kitchenId: $kitchenId, startDate: $startDate, endDate: $endDate) {
      id
      date
      mealType
      recipe {
        id
        title
        prepTime
        cookTime
        servings
      }
      notes
      completed
    }
  }
`;

export const GET_WEEKLY_MEAL_PLAN = gql`
  query GetWeeklyMealPlan($kitchenId: ID!, $weekStart: String!) {
    weeklyMealPlan(kitchenId: $kitchenId, weekStart: $weekStart) {
      id
      date
      mealType
      recipe {
        id
        title
        ingredients
        prepTime
        cookTime
        servings
      }
      notes
      completed
    }
  }
`;

// Expense Queries
export const GET_EXPENSES = gql`
  query GetExpenses($kitchenId: ID!, $startDate: String, $endDate: String) {
    expenses(kitchenId: $kitchenId, startDate: $startDate, endDate: $endDate) {
      id
      amount
      description
      category
      vendor
      date
      receipt
      items {
        name
        quantity
        price
        category
      }
      createdAt
    }
  }
`;

export const GET_EXPENSE_STATS = gql`
  query GetExpenseStats($kitchenId: ID!, $period: String!) {
    expenseStats(kitchenId: $kitchenId, period: $period) {
      totalAmount
      categoryBreakdown {
        category
        amount
        percentage
      }
      monthlyTrend {
        month
        amount
      }
      averagePerWeek
      averagePerMonth
    }
  }
`;

// Nutrition Queries
export const GET_NUTRITION_ENTRIES = gql`
  query GetNutritionEntries($kitchenId: ID!, $date: String!) {
    nutritionEntries(kitchenId: $kitchenId, date: $date) {
      id
      foodItem
      quantity
      unit
      calories
      protein
      carbs
      fat
      fiber
      sugar
      mealType
      createdAt
    }
  }
`;

export const GET_NUTRITION_GOALS = gql`
  query GetNutritionGoals($kitchenId: ID!) {
    nutritionGoals(kitchenId: $kitchenId) {
      id
      calories
      protein
      carbs
      fat
      fiber
      water
    }
  }
`;

export const GET_DAILY_NUTRITION_SUMMARY = gql`
  query GetDailyNutritionSummary($kitchenId: ID!, $date: String!) {
    dailyNutritionSummary(kitchenId: $kitchenId, date: $date) {
      totalCalories
      totalProtein
      totalCarbs
      totalFat
      totalFiber
      totalSugar
      waterIntake
      goals {
        calories
        protein
        carbs
        fat
        fiber
        water
      }
    }
  }
`;

// Waste Tracking Queries
export const GET_WASTE_ENTRIES = gql`
  query GetWasteEntries($kitchenId: ID!, $startDate: String, $endDate: String) {
    wasteEntries(kitchenId: $kitchenId, startDate: $startDate, endDate: $endDate) {
      id
      itemName
      quantity
      unit
      category
      reason
      cost
      preventable
      co2Impact
      waterImpact
      date
      createdAt
    }
  }
`;

export const GET_WASTE_STATS = gql`
  query GetWasteStats($kitchenId: ID!, $period: String!) {
    wasteStats(kitchenId: $kitchenId, period: $period) {
      totalItems
      totalCost
      totalCo2Impact
      totalWaterImpact
      preventablePercentage
      categoryBreakdown {
        category
        count
        cost
        percentage
      }
      reasonBreakdown {
        reason
        count
        percentage
      }
      monthlyTrend {
        month
        items
        cost
      }
    }
  }
`;

// Timer Queries
export const GET_TIMERS = gql`
  query GetTimers($kitchenId: ID!) {
    timers(kitchenId: $kitchenId) {
      id
      name
      duration
      remainingTime
      status
      category
      createdAt
      startedAt
      pausedAt
    }
  }
`;

export const GET_ACTIVE_TIMERS = gql`
  query GetActiveTimers($kitchenId: ID!) {
    activeTimers(kitchenId: $kitchenId) {
      id
      name
      duration
      remainingTime
      status
      category
      startedAt
    }
  }
`;

export const GET_TIMER_PRESETS = gql`
  query GetTimerPresets {
    timerPresets {
      id
      name
      duration
      category
      description
    }
  }
`;

// Reminder Queries
export const GET_REMINDERS = gql`
  query GetReminders($kitchenId: ID!) {
    reminders(kitchenId: $kitchenId) {
      id
      title
      description
      dueDate
      completed
      priority
      category
      recurring
      createdAt
    }
  }
`;

export const GET_UPCOMING_REMINDERS = gql`
  query GetUpcomingReminders($kitchenId: ID!, $days: Int = 7) {
    upcomingReminders(kitchenId: $kitchenId, days: $days) {
      id
      title
      description
      dueDate
      priority
      category
    }
  }
`;

// Notification Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int = 20) {
    notifications(limit: $limit) {
      id
      title
      message
      type
      read
      actionUrl
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;

// Usage Log Queries
export const GET_USAGE_LOGS = gql`
  query GetUsageLogs($kitchenId: ID!, $limit: Int = 50) {
    usageLogs(kitchenId: $kitchenId, limit: $limit) {
      id
      itemName
      quantity
      unit
      action
      createdAt
    }
  }
`;

export const GET_AI_SCANS = gql`
  query GetAIScans($kitchenId: ID!, $limit: Int = 20) {
    aiScans(kitchenId: $kitchenId, limit: $limit) {
      id
      type
      status
      result
      confidence
      createdAt
    }
  }
`;