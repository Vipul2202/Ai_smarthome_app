import { gql } from '@apollo/client';

// Auth Mutations
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        avatar
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// User Profile Mutations
export const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      email
      name
      avatar
      phone
    }
  }
`;

export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input)
  }
`;

export const GET_AVATAR_UPLOAD_URL_MUTATION = gql`
  mutation GetAvatarUploadUrl {
    getAvatarUploadUrl {
      url
      key
    }
  }
`;

// Household Mutations
export const CREATE_HOUSEHOLD_MUTATION = gql`
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    createHousehold(input: $input) {
      id
      name
      description
      createdAt
    }
  }
`;

export const UPDATE_HOUSEHOLD_MUTATION = gql`
  mutation UpdateHousehold($id: ID!, $input: CreateHouseholdInput!) {
    updateHousehold(id: $id, input: $input) {
      id
      name
      description
      updatedAt
    }
  }
`;

export const DELETE_HOUSEHOLD_MUTATION = gql`
  mutation DeleteHousehold($id: ID!) {
    deleteHousehold(id: $id)
  }
`;

export const INVITE_MEMBER_MUTATION = gql`
  mutation InviteMember($householdId: ID!, $email: String!, $role: HouseholdRole!) {
    inviteMember(householdId: $householdId, email: $email, role: $role)
  }
`;

// Kitchen Mutations
export const CREATE_KITCHEN_MUTATION = gql`
  mutation CreateKitchen($input: CreateKitchenInput!) {
    createKitchen(input: $input) {
      id
      name
      description
      type
      createdAt
    }
  }
`;

export const UPDATE_KITCHEN_MUTATION = gql`
  mutation UpdateKitchen($id: ID!, $input: CreateKitchenInput!) {
    updateKitchen(id: $id, input: $input) {
      id
      name
      description
      type
      updatedAt
    }
  }
`;

export const DELETE_KITCHEN_MUTATION = gql`
  mutation DeleteKitchen($id: ID!) {
    deleteKitchen(id: $id)
  }
`;

// Inventory Mutations
export const CREATE_INVENTORY_ITEM_MUTATION = gql`
  mutation CreateInventoryItem($input: CreateInventoryItemInput!) {
    createInventoryItem(input: $input) {
      id
      name
      category
      imageUrl
      defaultUnit
      threshold
      brand
      tags
      location
      createdAt
    }
  }
`;

export const UPDATE_INVENTORY_ITEM_MUTATION = gql`
  mutation UpdateInventoryItem($id: ID!, $input: UpdateInventoryItemInput!) {
    updateInventoryItem(id: $id, input: $input) {
      id
      name
      category
      imageUrl
      defaultUnit
      threshold
      brand
      tags
      location
      updatedAt
    }
  }
`;

export const DELETE_INVENTORY_ITEM_MUTATION = gql`
  mutation DeleteInventoryItem($id: ID!) {
    deleteInventoryItem(id: $id)
  }
`;

export const CREATE_INVENTORY_BATCH_MUTATION = gql`
  mutation CreateInventoryBatch($input: CreateInventoryBatchInput!) {
    createInventoryBatch(input: $input) {
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
  }
`;

export const UPDATE_INVENTORY_BATCH_MUTATION = gql`
  mutation UpdateInventoryBatch($id: ID!, $quantity: Float, $expiryDate: DateTime) {
    updateInventoryBatch(id: $id, quantity: $quantity, expiryDate: $expiryDate) {
      id
      quantity
      unit
      expiryDate
      updatedAt
    }
  }
`;

export const DELETE_INVENTORY_BATCH_MUTATION = gql`
  mutation DeleteInventoryBatch($id: ID!) {
    deleteInventoryBatch(id: $id)
  }
`;

// Shopping Mutations
export const CREATE_SHOPPING_LIST_MUTATION = gql`
  mutation CreateShoppingList($input: CreateShoppingListInput!) {
    createShoppingList(input: $input) {
      id
      title
      description
      type
      forDate
      isCompleted
      createdAt
    }
  }
`;

export const UPDATE_SHOPPING_LIST_MUTATION = gql`
  mutation UpdateShoppingList($id: ID!, $title: String, $description: String) {
    updateShoppingList(id: $id, title: $title, description: $description) {
      id
      title
      description
      updatedAt
    }
  }
`;

export const DELETE_SHOPPING_LIST_MUTATION = gql`
  mutation DeleteShoppingList($id: ID!) {
    deleteShoppingList(id: $id)
  }
`;

export const CREATE_SHOPPING_LIST_ITEM_MUTATION = gql`
  mutation CreateShoppingListItem($input: CreateShoppingListItemInput!) {
    createShoppingListItem(input: $input) {
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
  }
`;

export const UPDATE_SHOPPING_LIST_ITEM_MUTATION = gql`
  mutation UpdateShoppingListItem($id: ID!, $isPurchased: Boolean, $price: Float) {
    updateShoppingListItem(id: $id, isPurchased: $isPurchased, price: $price) {
      id
      isPurchased
      price
      updatedAt
    }
  }
`;

export const DELETE_SHOPPING_LIST_ITEM_MUTATION = gql`
  mutation DeleteShoppingListItem($id: ID!) {
    deleteShoppingListItem(id: $id)
  }
`;

export const GENERATE_AUTO_SHOPPING_LIST_MUTATION = gql`
  mutation GenerateAutoShoppingList($kitchenId: ID!, $type: ShoppingListType!) {
    generateAutoShoppingList(kitchenId: $kitchenId, type: $type) {
      id
      title
      description
      type
      items {
        id
        name
        quantity
        unit
      }
    }
  }
`;

// Expense Mutations
export const CREATE_EXPENSE_MUTATION = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
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

export const UPDATE_EXPENSE_MUTATION = gql`
  mutation UpdateExpense($id: ID!, $amount: Float, $notes: String) {
    updateExpense(id: $id, amount: $amount, notes: $notes) {
      id
      amount
      notes
      updatedAt
    }
  }
`;

export const DELETE_EXPENSE_MUTATION = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

// Reminder Mutations
export const CREATE_REMINDER_MUTATION = gql`
  mutation CreateReminder($input: CreateReminderInput!) {
    createReminder(input: $input) {
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

export const UPDATE_REMINDER_MUTATION = gql`
  mutation UpdateReminder($id: ID!, $isCompleted: Boolean) {
    updateReminder(id: $id, isCompleted: $isCompleted) {
      id
      isCompleted
      updatedAt
    }
  }
`;

export const DELETE_REMINDER_MUTATION = gql`
  mutation DeleteReminder($id: ID!) {
    deleteReminder(id: $id)
  }
`;

export const GENERATE_SMART_REMINDERS_MUTATION = gql`
  mutation GenerateSmartReminders($kitchenId: ID!) {
    generateSmartReminders(kitchenId: $kitchenId) {
      success
      remindersCreated
      reminders {
        id
        type
        title
        description
        scheduledAt
      }
    }
  }
`;

// Usage Log Mutations
export const CREATE_USAGE_LOG_MUTATION = gql`
  mutation CreateUsageLog($input: CreateUsageLogInput!) {
    createUsageLog(input: $input) {
      id
      type
      quantity
      unit
      notes
      date
      createdAt
    }
  }
`;

// AI Mutations
export const SCAN_IMAGE_MUTATION = gql`
  mutation ScanImage($input: AIImageScanInput!) {
    scanImage(input: $input) {
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

export const PROCESS_AI_SCAN_MUTATION = gql`
  mutation ProcessAIScan($scanId: ID!) {
    processAIScan(scanId: $scanId)
  }
`;

// OCR Mutations
export const PROCESS_RECEIPT_OCR_MUTATION = gql`
  mutation ProcessReceiptOCR($imageUrl: String!) {
    processReceiptOCR(imageUrl: $imageUrl) {
      success
      data
      message
    }
  }
`;

export const PROCESS_INVENTORY_ITEM_OCR_MUTATION = gql`
  mutation ProcessInventoryItemOCR($imageUrl: String!) {
    processInventoryItemOCR(imageUrl: $imageUrl) {
      success
      data
      message
    }
  }
`;

export const CREATE_INVENTORY_FROM_RECEIPT_MUTATION = gql`
  mutation CreateInventoryFromReceipt($receiptData: ReceiptDataInput!, $kitchenId: ID!) {
    createInventoryFromReceipt(receiptData: $receiptData, kitchenId: $kitchenId) {
      success
      items {
        id
        name
        category
        quantity: totalQuantity
      }
      message
    }
  }
`;

// Bulk Operations
export const BULK_CREATE_INVENTORY_ITEMS_MUTATION = gql`
  mutation BulkCreateInventoryItems($items: [CreateInventoryItemInput!]!) {
    bulkCreateInventoryItems(items: $items) {
      id
      name
      category
      createdAt
    }
  }
`;

export const BULK_UPDATE_INVENTORY_QUANTITIES_MUTATION = gql`
  mutation BulkUpdateInventoryQuantities($updates: [JSON!]!) {
    bulkUpdateInventoryQuantities(updates: $updates)
  }
`;

// Meal Planning Mutations
export const CREATE_MEAL_PLAN_MUTATION = gql`
  mutation CreateMealPlan($input: CreateMealPlanInput!) {
    createMealPlan(input: $input) {
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

export const UPDATE_MEAL_PLAN_MUTATION = gql`
  mutation UpdateMealPlan($id: ID!, $input: UpdateMealPlanInput!) {
    updateMealPlan(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_MEAL_PLAN_MUTATION = gql`
  mutation DeleteMealPlan($id: ID!) {
    deleteMealPlan(id: $id)
  }
`;

export const GENERATE_MEAL_PLAN_FROM_TEMPLATE_MUTATION = gql`
  mutation GenerateMealPlanFromTemplate($templateId: ID!, $startDate: DateTime!) {
    generateMealPlanFromTemplate(templateId: $templateId, startDate: $startDate) {
      id
      date
      mealType
      recipeName
      servings
      calories
      prepTime
      notes
    }
  }
`;

export const GENERATE_SHOPPING_LIST_FROM_MEAL_PLAN_MUTATION = gql`
  mutation GenerateShoppingListFromMealPlan($startDate: DateTime!, $endDate: DateTime!, $kitchenId: ID!) {
    generateShoppingListFromMealPlan(startDate: $startDate, endDate: $endDate, kitchenId: $kitchenId) {
      id
      title
      description
      type
      items {
        id
        name
        quantity
        unit
        notes
      }
    }
  }
`;

// Nutrition Mutations
export const CREATE_NUTRITION_ENTRY_MUTATION = gql`
  mutation CreateNutritionEntry($input: CreateNutritionEntryInput!) {
    createNutritionEntry(input: $input) {
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
    }
  }
`;

export const UPDATE_NUTRITION_ENTRY_MUTATION = gql`
  mutation UpdateNutritionEntry($id: ID!, $input: UpdateNutritionEntryInput!) {
    updateNutritionEntry(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_NUTRITION_ENTRY_MUTATION = gql`
  mutation DeleteNutritionEntry($id: ID!) {
    deleteNutritionEntry(id: $id)
  }
`;

export const UPDATE_NUTRITION_GOALS_MUTATION = gql`
  mutation UpdateNutritionGoals($input: UpdateNutritionGoalsInput!) {
    updateNutritionGoals(input: $input) {
      id
      dailyCalories
      dailyProtein
      dailyCarbs
      dailyFat
      dailyFiber
      dailyWater
      weightGoal
      activityLevel
      updatedAt
    }
  }
`;

export const LOG_WATER_INTAKE_MUTATION = gql`
  mutation LogWaterIntake($amount: Float!, $time: DateTime) {
    logWaterIntake(amount: $amount, time: $time) {
      id
      amount
      time
      createdAt
    }
  }
`;

export const QUICK_LOG_FOOD_MUTATION = gql`
  mutation QuickLogFood($foodName: String!, $mealType: MealType!, $date: DateTime!) {
    quickLogFood(foodName: $foodName, mealType: $mealType, date: $date) {
      id
      foodName
      mealType
      date
      calories
      protein
      carbs
      fat
      createdAt
    }
  }
`;

// Waste Tracking Mutations
export const CREATE_WASTE_ENTRY_MUTATION = gql`
  mutation CreateWasteEntry($input: CreateWasteEntryInput!) {
    createWasteEntry(input: $input) {
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
    }
  }
`;

export const UPDATE_WASTE_ENTRY_MUTATION = gql`
  mutation UpdateWasteEntry($id: ID!, $input: UpdateWasteEntryInput!) {
    updateWasteEntry(id: $id, input: $input) {
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
      updatedAt
    }
  }
`;

export const DELETE_WASTE_ENTRY_MUTATION = gql`
  mutation DeleteWasteEntry($id: ID!) {
    deleteWasteEntry(id: $id)
  }
`;

export const UPDATE_WASTE_GOALS_MUTATION = gql`
  mutation UpdateWasteGoals($input: UpdateWasteGoalsInput!) {
    updateWasteGoals(input: $input) {
      id
      monthlyWasteKg
      monthlyCostSave
      co2SaveKg
      waterSaveLiters
      updatedAt
    }
  }
`;

export const BULK_CREATE_WASTE_ENTRIES_MUTATION = gql`
  mutation BulkCreateWasteEntries($entries: [CreateWasteEntryInput!]!) {
    bulkCreateWasteEntries(entries: $entries)
  }
`;

// Kitchen Timer Mutations
export const CREATE_TIMER_MUTATION = gql`
  mutation CreateTimer($input: CreateKitchenTimerInput!) {
    createTimer(input: $input) {
      id
      name
      duration
      category
      isActive
      notes
      createdAt
    }
  }
`;

export const UPDATE_TIMER_MUTATION = gql`
  mutation UpdateTimer($id: ID!, $input: UpdateKitchenTimerInput!) {
    updateTimer(id: $id, input: $input) {
      id
      name
      duration
      category
      notes
      updatedAt
    }
  }
`;

export const DELETE_TIMER_MUTATION = gql`
  mutation DeleteTimer($id: ID!) {
    deleteTimer(id: $id)
  }
`;

export const START_TIMER_MUTATION = gql`
  mutation StartTimer($id: ID!) {
    startTimer(id: $id) {
      id
      isActive
      startedAt
      pausedAt
    }
  }
`;

export const PAUSE_TIMER_MUTATION = gql`
  mutation PauseTimer($id: ID!) {
    pauseTimer(id: $id) {
      id
      isActive
      pausedAt
    }
  }
`;

export const STOP_TIMER_MUTATION = gql`
  mutation StopTimer($id: ID!) {
    stopTimer(id: $id) {
      id
      isActive
      completedAt
    }
  }
`;

export const RESET_TIMER_MUTATION = gql`
  mutation ResetTimer($id: ID!) {
    resetTimer(id: $id) {
      id
      isActive
      startedAt
      pausedAt
      completedAt
    }
  }
`;

export const CREATE_TIMER_FROM_PRESET_MUTATION = gql`
  mutation CreateTimerFromPreset($presetName: String!, $customName: String) {
    createTimerFromPreset(presetName: $presetName, customName: $customName) {
      id
      name
      duration
      category
      createdAt
    }
  }
`;

export const BULK_STOP_TIMERS_MUTATION = gql`
  mutation BulkStopTimers($timerIds: [ID!]!) {
    bulkStopTimers(timerIds: $timerIds)
  }
`;

// Notification Mutations
export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const DELETE_ALL_NOTIFICATIONS_MUTATION = gql`
  mutation DeleteAllNotifications {
    deleteAllNotifications
  }
`;

export const SEND_TEST_NOTIFICATION_MUTATION = gql`
  mutation SendTestNotification($title: String, $message: String) {
    sendTestNotification(title: $title, message: $message)
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES_MUTATION = gql`
  mutation UpdateNotificationPreferences($preferences: NotificationPreferencesInput!) {
    updateNotificationPreferences(preferences: $preferences)
  }
`;

// Recipe Management Mutations
export const SAVE_RECIPE_MUTATION = gql`
  mutation SaveRecipe($input: SaveRecipeInput!) {
    saveRecipe(input: $input) {
      id
      title
      ingredients
      steps
      cuisine
      prepTime
      calories
      difficulty
      servings
      isFavorite
      createdAt
    }
  }
`;

export const TOGGLE_RECIPE_FAVORITE_MUTATION = gql`
  mutation ToggleRecipeFavorite($recipeId: ID!) {
    toggleRecipeFavorite(recipeId: $recipeId) {
      id
      isFavorite
    }
  }
`;

export const DELETE_RECIPE_MUTATION = gql`
  mutation DeleteRecipe($recipeId: ID!) {
    deleteRecipe(recipeId: $recipeId)
  }
`;