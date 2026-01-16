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
      name
      email
      avatar
      phone
      location
    }
  }
`;

export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
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

export const GET_AVATAR_UPLOAD_URL_MUTATION = gql`
  mutation GetAvatarUploadUrl {
    getAvatarUploadUrl {
      uploadUrl
      fileUrl
    }
  }
`;

// Household & Kitchen Mutations
export const CREATE_HOUSEHOLD_MUTATION = gql`
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    createHousehold(input: $input) {
      id
      name
      description
      inviteCode
    }
  }
`;

export const UPDATE_HOUSEHOLD_MUTATION = gql`
  mutation UpdateHousehold($id: ID!, $input: UpdateHouseholdInput!) {
    updateHousehold(id: $id, input: $input) {
      id
      name
      description
    }
  }
`;

export const DELETE_HOUSEHOLD_MUTATION = gql`
  mutation DeleteHousehold($id: ID!) {
    deleteHousehold(id: $id)
  }
`;

export const INVITE_MEMBER_MUTATION = gql`
  mutation InviteMember($householdId: ID!, $email: String!, $role: String!) {
    inviteMember(householdId: $householdId, email: $email, role: $role) {
      success
      message
    }
  }
`;

export const CREATE_KITCHEN_MUTATION = gql`
  mutation CreateKitchen($input: CreateKitchenInput!) {
    createKitchen(input: $input) {
      id
      name
      description
      householdId
    }
  }
`;

export const UPDATE_KITCHEN_MUTATION = gql`
  mutation UpdateKitchen($id: ID!, $input: UpdateKitchenInput!) {
    updateKitchen(id: $id, input: $input) {
      id
      name
      description
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
      quantity
      unit
      expiryDate
      barcode
      image
    }
  }
`;

export const UPDATE_INVENTORY_ITEM_MUTATION = gql`
  mutation UpdateInventoryItem($id: ID!, $input: UpdateInventoryItemInput!) {
    updateInventoryItem(id: $id, input: $input) {
      id
      name
      category
      quantity
      unit
      expiryDate
      barcode
      image
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
      expiryDate
      purchaseDate
      price
    }
  }
`;

export const UPDATE_INVENTORY_BATCH_MUTATION = gql`
  mutation UpdateInventoryBatch($id: ID!, $input: UpdateInventoryBatchInput!) {
    updateInventoryBatch(id: $id, input: $input) {
      id
      quantity
      expiryDate
      purchaseDate
      price
    }
  }
`;

export const DELETE_INVENTORY_BATCH_MUTATION = gql`
  mutation DeleteInventoryBatch($id: ID!) {
    deleteInventoryBatch(id: $id)
  }
`;

export const BULK_CREATE_INVENTORY_ITEMS_MUTATION = gql`
  mutation BulkCreateInventoryItems($input: BulkCreateInventoryItemsInput!) {
    bulkCreateInventoryItems(input: $input) {
      success
      count
      items {
        id
        name
        category
        quantity
        unit
      }
    }
  }
`;

// Shopping List Mutations
export const CREATE_SHOPPING_LIST_MUTATION = gql`
  mutation CreateShoppingList($input: CreateShoppingListInput!) {
    createShoppingList(input: $input) {
      id
      name
      type
      kitchenId
    }
  }
`;

export const UPDATE_SHOPPING_LIST_MUTATION = gql`
  mutation UpdateShoppingList($id: ID!, $input: UpdateShoppingListInput!) {
    updateShoppingList(id: $id, input: $input) {
      id
      name
      type
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
      completed
      price
      category
    }
  }
`;

export const UPDATE_SHOPPING_LIST_ITEM_MUTATION = gql`
  mutation UpdateShoppingListItem($id: ID!, $input: UpdateShoppingListItemInput!) {
    updateShoppingListItem(id: $id, input: $input) {
      id
      name
      quantity
      unit
      completed
      price
      category
    }
  }
`;

export const DELETE_SHOPPING_LIST_ITEM_MUTATION = gql`
  mutation DeleteShoppingListItem($id: ID!) {
    deleteShoppingListItem(id: $id)
  }
`;

export const GENERATE_AUTO_SHOPPING_LIST_MUTATION = gql`
  mutation GenerateAutoShoppingList($kitchenId: ID!, $type: String!) {
    generateAutoShoppingList(kitchenId: $kitchenId, type: $type) {
      id
      name
      type
      items {
        id
        name
        quantity
        unit
        category
      }
    }
  }
`;

// Expense Mutations
export const CREATE_EXPENSE_MUTATION = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      amount
      description
      category
      vendor
      date
      receipt
    }
  }
`;

export const UPDATE_EXPENSE_MUTATION = gql`
  mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
    updateExpense(id: $id, input: $input) {
      id
      amount
      description
      category
      vendor
      date
    }
  }
`;

export const DELETE_EXPENSE_MUTATION = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

// Recipe Mutations
export const SAVE_RECIPE_MUTATION = gql`
  mutation SaveRecipe($input: SaveRecipeInput!) {
    saveRecipe(input: $input) {
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
    }
  }
`;

export const TOGGLE_RECIPE_FAVORITE_MUTATION = gql`
  mutation ToggleRecipeFavorite($id: ID!) {
    toggleRecipeFavorite(id: $id) {
      id
      isFavorite
    }
  }
`;

export const DELETE_RECIPE_MUTATION = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id)
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
      notes
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
      notes
      completed
    }
  }
`;

export const DELETE_MEAL_PLAN_MUTATION = gql`
  mutation DeleteMealPlan($id: ID!) {
    deleteMealPlan(id: $id)
  }
`;

export const GENERATE_MEAL_PLAN_FROM_TEMPLATE_MUTATION = gql`
  mutation GenerateMealPlanFromTemplate($input: GenerateMealPlanFromTemplateInput!) {
    generateMealPlanFromTemplate(input: $input) {
      success
      count
      mealPlans {
        id
        date
        mealType
        recipe {
          id
          title
        }
      }
    }
  }
`;

export const GENERATE_SHOPPING_LIST_FROM_MEAL_PLAN_MUTATION = gql`
  mutation GenerateShoppingListFromMealPlan($input: GenerateShoppingListFromMealPlanInput!) {
    generateShoppingListFromMealPlan(input: $input) {
      id
      name
      items {
        id
        name
        quantity
        unit
        category
      }
    }
  }
`;

// Nutrition Mutations
export const CREATE_NUTRITION_ENTRY_MUTATION = gql`
  mutation CreateNutritionEntry($input: CreateNutritionEntryInput!) {
    createNutritionEntry(input: $input) {
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
    }
  }
`;

export const UPDATE_NUTRITION_ENTRY_MUTATION = gql`
  mutation UpdateNutritionEntry($id: ID!, $input: UpdateNutritionEntryInput!) {
    updateNutritionEntry(id: $id, input: $input) {
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
      calories
      protein
      carbs
      fat
      fiber
      water
    }
  }
`;

export const LOG_WATER_INTAKE_MUTATION = gql`
  mutation LogWaterIntake($kitchenId: ID!, $amount: Float!, $date: String!) {
    logWaterIntake(kitchenId: $kitchenId, amount: $amount, date: $date) {
      success
      totalIntake
    }
  }
`;

export const QUICK_LOG_FOOD_MUTATION = gql`
  mutation QuickLogFood($input: QuickLogFoodInput!) {
    quickLogFood(input: $input) {
      id
      foodItem
      calories
      mealType
    }
  }
`;

// Waste Tracking Mutations
export const CREATE_WASTE_ENTRY_MUTATION = gql`
  mutation CreateWasteEntry($input: CreateWasteEntryInput!) {
    createWasteEntry(input: $input) {
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
    }
  }
`;

export const UPDATE_WASTE_ENTRY_MUTATION = gql`
  mutation UpdateWasteEntry($id: ID!, $input: UpdateWasteEntryInput!) {
    updateWasteEntry(id: $id, input: $input) {
      id
      itemName
      quantity
      unit
      category
      reason
      cost
      preventable
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
      maxItemsPerWeek
      maxCostPerWeek
      targetReductionPercentage
    }
  }
`;

export const BULK_CREATE_WASTE_ENTRIES_MUTATION = gql`
  mutation BulkCreateWasteEntries($input: BulkCreateWasteEntriesInput!) {
    bulkCreateWasteEntries(input: $input) {
      success
      count
      entries {
        id
        itemName
        quantity
        cost
      }
    }
  }
`;

// Timer Mutations
export const CREATE_TIMER_MUTATION = gql`
  mutation CreateTimer($input: CreateTimerInput!) {
    createTimer(input: $input) {
      id
      name
      duration
      category
    }
  }
`;

export const UPDATE_TIMER_MUTATION = gql`
  mutation UpdateTimer($id: ID!, $input: UpdateTimerInput!) {
    updateTimer(id: $id, input: $input) {
      id
      name
      duration
      category
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
      status
      startedAt
      remainingTime
    }
  }
`;

export const PAUSE_TIMER_MUTATION = gql`
  mutation PauseTimer($id: ID!) {
    pauseTimer(id: $id) {
      id
      status
      pausedAt
      remainingTime
    }
  }
`;

export const STOP_TIMER_MUTATION = gql`
  mutation StopTimer($id: ID!) {
    stopTimer(id: $id) {
      id
      status
      remainingTime
    }
  }
`;

export const RESET_TIMER_MUTATION = gql`
  mutation ResetTimer($id: ID!) {
    resetTimer(id: $id) {
      id
      status
      remainingTime
    }
  }
`;

export const CREATE_TIMER_FROM_PRESET_MUTATION = gql`
  mutation CreateTimerFromPreset($presetId: ID!, $kitchenId: ID!) {
    createTimerFromPreset(presetId: $presetId, kitchenId: $kitchenId) {
      id
      name
      duration
      category
    }
  }
`;

export const BULK_STOP_TIMERS_MUTATION = gql`
  mutation BulkStopTimers($timerIds: [ID!]!) {
    bulkStopTimers(timerIds: $timerIds) {
      success
      count
    }
  }
`;

// Reminder Mutations
export const CREATE_REMINDER_MUTATION = gql`
  mutation CreateReminder($input: CreateReminderInput!) {
    createReminder(input: $input) {
      id
      title
      description
      dueDate
      priority
      category
      recurring
    }
  }
`;

export const UPDATE_REMINDER_MUTATION = gql`
  mutation UpdateReminder($id: ID!, $input: UpdateReminderInput!) {
    updateReminder(id: $id, input: $input) {
      id
      title
      description
      dueDate
      completed
      priority
      category
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
      count
      reminders {
        id
        title
        description
        dueDate
        category
      }
    }
  }
`;

// Notification Mutations
export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      count
    }
  }
`;

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const DELETE_ALL_NOTIFICATIONS_MUTATION = gql`
  mutation DeleteAllNotifications {
    deleteAllNotifications {
      success
      count
    }
  }
`;

export const SEND_TEST_NOTIFICATION_MUTATION = gql`
  mutation SendTestNotification($type: String!) {
    sendTestNotification(type: $type) {
      success
      message
    }
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES_MUTATION = gql`
  mutation UpdateNotificationPreferences($input: UpdateNotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      id
      lowStock
      expiry
      shopping
      mealPlan
      push
      email
      sms
    }
  }
`;

// Usage Log Mutations
export const CREATE_USAGE_LOG_MUTATION = gql`
  mutation CreateUsageLog($input: CreateUsageLogInput!) {
    createUsageLog(input: $input) {
      id
      itemName
      quantity
      unit
      action
    }
  }
`;

// AI & OCR Mutations
export const SCAN_IMAGE_MUTATION = gql`
  mutation ScanImage($input: ScanImageInput!) {
    scanImage(input: $input) {
      id
      type
      status
      result
      confidence
    }
  }
`;

export const PROCESS_AI_SCAN_MUTATION = gql`
  mutation ProcessAIScan($input: ProcessAIScanInput!) {
    processAIScan(input: $input) {
      id
      type
      status
      result
      confidence
      items {
        name
        quantity
        unit
        category
        confidence
      }
    }
  }
`;

export const PROCESS_RECEIPT_OCR_MUTATION = gql`
  mutation ProcessReceiptOCR($input: ProcessReceiptOCRInput!) {
    processReceiptOCR(input: $input) {
      id
      vendor
      date
      total
      items {
        name
        quantity
        price
        category
      }
      confidence
    }
  }
`;

export const PROCESS_INVENTORY_ITEM_OCR_MUTATION = gql`
  mutation ProcessInventoryItemOCR($input: ProcessInventoryItemOCRInput!) {
    processInventoryItemOCR(input: $input) {
      id
      name
      category
      expiryDate
      barcode
      confidence
    }
  }
`;

export const CREATE_INVENTORY_FROM_RECEIPT_MUTATION = gql`
  mutation CreateInventoryFromReceipt($input: CreateInventoryFromReceiptInput!) {
    createInventoryFromReceipt(input: $input) {
      success
      count
      items {
        id
        name
        category
        quantity
        unit
      }
    }
  }
`;