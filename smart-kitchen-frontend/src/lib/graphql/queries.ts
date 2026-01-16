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

// Settings Queries
export const GET_USER_SETTINGS = gql`
  query GetUserSettings {
    userSettings {
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
  }
`;

export const GET_USER_PREFERENCES = gql`
  query GetUserPreferences {
    userPreferences {
      theme
      language
      currency
      timezone
      dateFormat
    }
  }
`;

// Settings Mutations
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      email
      phone
      location
      avatar
    }
  }
`;

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input)
  }
`;

export const UPDATE_USER_PREFERENCES = gql`
  mutation UpdateUserPreferences($input: UpdateUserPreferencesInput!) {
    updateUserPreferences(input: $input)
  }
`;

// Household Queries
export const GET_HOUSEHOLDS = gql`
  query GetHouseholds {
    households {
      id
      name
      description
      inviteCode
      kitchens {
        id
        name
        type
        description
      }
      members {
        id
        role
        joinedAt
        user {
          id
          name
          email
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_HOUSEHOLD = gql`
  query GetHousehold($id: ID!) {
    household(id: $id) {
      id
      name
      description
      kitchens {
        id
        name
        description
        type
      }
      members {
        id
        role
        joinedAt
        user {
          id
          name
          email
          avatar
        }
      }
      createdAt
    }
  }
`;

// Kitchen Queries
export const GET_KITCHENS = gql`
  query GetKitchens($householdId: ID!) {
    kitchens(householdId: $householdId) {
      id
      name
      description
      type
      createdAt
    }
  }
`;

export const GET_KITCHEN = gql`
  query GetKitchen($id: ID!) {
    kitchen(id: $id) {
      id
      name
      description
      type
      household {
        id
        name
      }
      createdAt
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
      imageUrl
      defaultUnit
      threshold
      brand
      tags
      location
      totalQuantity
      status
      nextExpiry
      batches {
        id
        quantity
        unit
        expiryDate
        purchaseDate
        purchasePrice
        vendor
        status
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVENTORY_ITEM = gql`
  query GetInventoryItem($id: ID!) {
    inventoryItem(id: $id) {
      id
      name
      category
      imageUrl
      defaultUnit
      threshold
      brand
      tags
      location
      totalQuantity
      status
      nextExpiry
      batches {
        id
        quantity
        unit
        expiryDate
        purchaseDate
        purchasePrice
        vendor
        status
        createdAt
      }
      usageLogs {
        id
        type
        quantity
        unit
        notes
        date
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
      totalQuantity
      threshold
      status
      location
    }
  }
`;

export const GET_EXPIRING_ITEMS = gql`
  query GetExpiringItems($kitchenId: ID!, $days: Int = 7) {
    expiringItems(kitchenId: $kitchenId, days: $days) {
      id
      name
      category
      nextExpiry
      totalQuantity
      status
      batches {
        id
        quantity
        unit
        expiryDate
      }
    }
  }
`;

// Shopping Queries
export const GET_SHOPPING_LISTS = gql`
  query GetShoppingLists($kitchenId: ID!) {
    shoppingLists(kitchenId: $kitchenId) {
      id
      title
      description
      type
      forDate
      isCompleted
      totalItems
      completedItems
      estimatedTotal
      items {
        id
        name
        quantity
        unit
        isPurchased
        price
        notes
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
      title
      description
      type
      forDate
      isCompleted
      totalItems
      completedItems
      estimatedTotal
      items {
        id
        name
        quantity
        unit
        linkedItemId
        isPurchased
        price
        notes
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

// Expense Queries
export const GET_EXPENSES = gql`
  query GetExpenses($kitchenId: ID!, $limit: Int = 50) {
    expenses(kitchenId: $kitchenId, limit: $limit) {
      id
      type
      amount
      vendor
      date
      billImageUrl
      items
      notes
      category
      createdAt
    }
  }
`;

export const GET_EXPENSE_STATS = gql`
  query GetExpenseStats($kitchenId: ID!, $period: String!) {
    expenseStats(kitchenId: $kitchenId, period: $period)
  }
`;

export const GET_PRICE_TRENDS = gql`
  query GetPriceTrends($kitchenId: ID!, $days: Int = 30) {
    priceTrends(kitchenId: $kitchenId, days: $days)
  }
`;

// Reminder Queries
export const GET_REMINDERS = gql`
  query GetReminders($kitchenId: ID!) {
    reminders(kitchenId: $kitchenId) {
      id
      type
      title
      description
      scheduledAt
      isRecurring
      frequency
      isCompleted
      meta
      createdAt
    }
  }
`;

export const GET_UPCOMING_REMINDERS = gql`
  query GetUpcomingReminders($kitchenId: ID!, $days: Int = 7) {
    upcomingReminders(kitchenId: $kitchenId, days: $days) {
      id
      type
      title
      description
      scheduledAt
      isRecurring
      isCompleted
      createdAt
    }
  }
`;

// Recipe Queries
export const GET_RECIPE_HISTORY = gql`
  query GetRecipeHistory($kitchenId: ID) {
    recipeHistory(kitchenId: $kitchenId) {
      id
      title
      ingredients
      steps
      cuisine
      prepTime
      calories
      source
      isFavorite
      createdAt
    }
  }
`;

export const GENERATE_RECIPE = gql`
  query GenerateRecipe($input: GenerateRecipeInput!) {
    generateRecipe(input: $input) {
      title
      ingredients
      steps
      cuisine
      prepTime
      calories
      difficulty
      servings
    }
  }
`;

// Usage Logs Queries
export const GET_USAGE_LOGS = gql`
  query GetUsageLogs($kitchenId: ID!, $limit: Int) {
    usageLogs(kitchenId: $kitchenId, limit: $limit) {
      id
      type
      quantity
      unit
      notes
      date
      createdAt
      item {
        id
        name
        category
        defaultUnit
      }
    }
  }
`;



// AI Queries
export const GET_AI_SCANS = gql`
  query GetAIScans($limit: Int = 20) {
    aiScans(limit: $limit) {
      id
      imageUrl
      scanType
      result
      confidence
      processed
      createdAt
    }
  }
`;

// Meal Planning Queries
export const GET_MEAL_PLANS = gql`
  query GetMealPlans($startDate: DateTime, $endDate: DateTime) {
    mealPlans(startDate: $startDate, endDate: $endDate) {
      id
      date
      mealType
      recipeId
      recipeName
      servings
      calories
      prepTime
      notes
      isCompleted
      kitchenId
      createdAt
      updatedAt
    }
  }
`;

export const GET_WEEKLY_MEAL_PLAN = gql`
  query GetWeeklyMealPlan($weekStart: DateTime!) {
    weeklyMealPlan(weekStart: $weekStart) {
      id
      date
      mealType
      recipeId
      recipeName
      servings
      calories
      prepTime
      notes
      isCompleted
      kitchenId
      createdAt
    }
  }
`;

export const GET_MEAL_PLAN_TEMPLATES = gql`
  query GetMealPlanTemplates($category: String) {
    mealPlanTemplates(category: $category) {
      id
      name
      description
      category
      meals
      duration
      isPublic
      createdAt
    }
  }
`;

// Nutrition Queries
export const GET_NUTRITION_ENTRIES = gql`
  query GetNutritionEntries($date: DateTime, $startDate: DateTime, $endDate: DateTime) {
    nutritionEntries(date: $date, startDate: $startDate, endDate: $endDate) {
      id
      date
      mealType
      foodName
      quantity
      unit
      calories
      protein
      carbs
      fat
      fiber
      sugar
      sodium
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_NUTRITION_GOALS = gql`
  query GetNutritionGoals {
    nutritionGoals {
      id
      dailyCalories
      dailyProtein
      dailyCarbs
      dailyFat
      dailyFiber
      dailyWater
      weightGoal
      activityLevel
      createdAt
      updatedAt
    }
  }
`;

export const GET_DAILY_NUTRITION_SUMMARY = gql`
  query GetDailyNutritionSummary($date: DateTime!) {
    dailyNutritionSummary(date: $date) {
      date
      calories
      protein
      carbs
      fat
      fiber
      sugar
      sodium
      water
      entries {
        id
        mealType
        foodName
        quantity
        unit
        calories
        protein
        carbs
        fat
      }
      waterIntakes {
        id
        amount
        time
        createdAt
      }
    }
  }
`;

export const GET_NUTRITION_TRENDS = gql`
  query GetNutritionTrends($days: Int) {
    nutritionTrends(days: $days)
  }
`;

// Waste Tracking Queries
export const GET_WASTE_ENTRIES = gql`
  query GetWasteEntries($startDate: DateTime, $endDate: DateTime, $category: String) {
    wasteEntries(startDate: $startDate, endDate: $endDate, category: $category) {
      id
      date
      itemName
      category
      quantity
      unit
      reason
      cost
      preventable
      notes
      kitchenId
      createdAt
      updatedAt
    }
  }
`;

export const GET_WASTE_GOALS = gql`
  query GetWasteGoals {
    wasteGoals {
      id
      monthlyWasteKg
      monthlyCostSave
      co2SaveKg
      waterSaveLiters
      createdAt
      updatedAt
    }
  }
`;

export const GET_WASTE_STATS = gql`
  query GetWasteStats($period: String) {
    wasteStats(period: $period) {
      period
      startDate
      endDate
      totalEntries
      totalWasteKg
      totalCost
      preventableWasteKg
      preventablePercentage
      co2Impact
      waterImpact
      categoryBreakdown
      reasonBreakdown
    }
  }
`;

export const GET_WASTE_TRENDS = gql`
  query GetWasteTrends($days: Int) {
    wasteTrends(days: $days)
  }
`;

// Kitchen Timer Queries
export const GET_TIMERS = gql`
  query GetTimers($isActive: Boolean) {
    timers(isActive: $isActive) {
      id
      name
      duration
      category
      isActive
      startedAt
      pausedAt
      completedAt
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACTIVE_TIMERS = gql`
  query GetActiveTimers {
    activeTimers {
      id
      name
      duration
      category
      isActive
      startedAt
      pausedAt
      notes
      createdAt
    }
  }
`;

export const GET_TIMER = gql`
  query GetTimer($id: ID!) {
    timer(id: $id) {
      id
      name
      duration
      category
      isActive
      startedAt
      pausedAt
      completedAt
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_TIMER_PRESETS = gql`
  query GetTimerPresets {
    timerPresets {
      name
      duration
      category
    }
  }
`;

// Notification Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int, $unreadOnly: Boolean) {
    notifications(limit: $limit, unreadOnly: $unreadOnly) {
      id
      type
      title
      message
      data
      isRead
      sentAt
      readAt
      createdAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query GetUnreadNotificationCount {
    unreadNotificationCount
  }
`;