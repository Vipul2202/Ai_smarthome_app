import { gql } from 'graphql-tag';
import { DocumentNode } from 'graphql';

export const typeDefs: DocumentNode = gql`
  scalar DateTime
  scalar JSON

  # Auth Types
  type User {
    id: ID!
    userId: String
    email: String!
    name: String
    avatar: String
    phone: String
    location: String
    emailVerified: Boolean!
    provider: String!
    preferences: UserPreferences
    createdAt: DateTime!
    updatedAt: DateTime!
    houses: [House!]!
  }

  # House Types
  type House {
    id: ID!
    userId: ID!
    name: String!
    description: String
    createdDate: DateTime!
    updatedAt: DateTime!
    user: User!
    inventory: [InventoryItem!]!
    shares: [HouseShare!]!
    invitations: [HouseInvitation!]!
    userRole: HouseRole
  }

  type HouseShare {
    id: ID!
    houseId: ID!
    userId: ID!
    role: HouseRole!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  type HouseInvitation {
    id: ID!
    houseId: ID!
    inviteCode: String!
    invitedUserId: ID
    role: HouseRole!
    expiryDate: DateTime!
    status: InvitationStatus!
    createdDate: DateTime!
    usedDate: DateTime
    house: House!
  }

  enum HouseRole {
    READ
    WRITE
  }

  enum InvitationStatus {
    PENDING
    ACCEPTED
    EXPIRED
  }

  type UserPreferences {
    id: ID!
    userId: ID!
    theme: Theme!
    language: String!
    currency: String!
    timezone: String!
    dateFormat: String!
    lowStockNotifications: Boolean!
    expiryNotifications: Boolean!
    pushNotifications: Boolean!
    emailNotifications: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum Theme {
    LIGHT
    DARK
    SYSTEM
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Inventory Types (Simplified)
  type InventoryItem {
    id: ID!
    houseId: ID!
    house: House!
    name: String!
    category: String
    location: String
    quantity: Float!
    unit: String!
    imageUrl: String
    barcode: String
    description: String
    expiryDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Voice Control Types
  type VoiceIntent {
    intent: VoiceIntentType!
    item: VoiceItemData!
    confidence: Float!
    missingInfo: [String!]!
  }

  enum VoiceIntentType {
    ADD
    UPDATE
    SEARCH
    DELETE
    UNKNOWN
  }

  type VoiceItemData {
    name: String!
    quantity: Float
    unit: String
    category: String
    location: String
  }

  type InventorySearchResult {
    id: ID!
    name: String!
    category: String!
    quantity: Float!
    unit: String!
    location: String!
    similarity: Float!
  }

  type VoiceUpdateResult {
    success: Boolean!
    message: String!
    item: InventorySearchResult
  }

  type SpeechGenerationResult {
    success: Boolean!
    speechData: String
  }

  # AI Scan Types
  type AIScan {
    id: ID!
    imageUrl: String!
    scanType: String!
    result: JSON!
    confidence: Float
    processed: Boolean!
    createdAt: DateTime!
  }

  # Kitchen Timer Types
  type KitchenTimer {
    id: ID!
    userId: String!
    name: String!
    duration: Int!
    category: TimerCategory!
    isActive: Boolean!
    startedAt: DateTime
    pausedAt: DateTime
    completedAt: DateTime
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum TimerCategory {
    COOKING
    BAKING
    STEAMING
    BOILING
    MARINATING
    RESTING
    CUSTOM
  }

  type TimerPreset {
    name: String!
    duration: Int!
    category: TimerCategory!
  }

  # Input Types
  input RegisterInput {
    email: String!
    password: String!
    name: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserProfileInput {
    name: String
    phone: String
    location: String
    avatar: String
  }

  input UpdateUserPreferencesInput {
    theme: Theme
    language: String
    currency: String
    timezone: String
    dateFormat: String
    lowStockNotifications: Boolean
    expiryNotifications: Boolean
    pushNotifications: Boolean
    emailNotifications: Boolean
  }

  input CreateHouseInput {
    name: String!
    description: String
  }

  input UpdateHouseInput {
    name: String
    description: String
  }

  input CreateHouseInvitationInput {
    houseId: ID!
    invitedUserId: String!
    role: HouseRole!
    expiryDays: Int
  }

  input AcceptHouseInvitationInput {
    inviteCode: String!
  }

  type HouseInvitationResult {
    invitation: HouseInvitation!
    inviteLink: String!
  }

  input CreateInventoryItemInput {
    houseId: ID!
    name: String!
    category: String
    location: String
    quantity: Float!
    unit: String!
    imageUrl: String
    barcode: String
    description: String
  }

  input CreateInventoryItemsInput {
    houseId: ID!
    items: [CreateInventoryItemInput!]!
  }

  input BulkCreateInventoryItemsInput {
    houseId: ID!
    items: [CreateInventoryItemInput!]!
  }

  type BulkInventoryResult {
    count: Int!
    items: [InventoryItem!]!
  }

  input UpdateInventoryItemInput {
    name: String
    category: String
    location: String
    quantity: Float
    unit: String
    imageUrl: String
    barcode: String
    description: String
  }

  input AIImageScanInput {
    imageUrl: String!
    scanType: String!
  }

  input CreateKitchenTimerInput {
    name: String!
    duration: Int!
    category: TimerCategory!
    notes: String
  }

  input UpdateKitchenTimerInput {
    name: String
    duration: Int
    category: TimerCategory
    notes: String
  }

  # Queries
  type Query {
    # Auth
    me: User
    userByUserId(userId: String!): User

    # User Preferences
    userPreferences: UserPreferences

    # Houses
    houses: [House!]!
    house(id: ID!): House
    sharedHouses: [House!]!
    houseInvitations(houseId: ID!): [HouseInvitation!]!
    houseShares(houseId: ID!): [HouseShare!]!

    # Inventory
    inventoryItems(houseId: ID!): [InventoryItem!]!
    inventoryItem(id: ID!): InventoryItem

    # AI
    aiScans(limit: Int = 20): [AIScan!]!

    # Kitchen Timer
    timers(isActive: Boolean): [KitchenTimer!]!
    activeTimers: [KitchenTimer!]!
    timer(id: ID!): KitchenTimer
    timerPresets: [TimerPreset!]!

    # Voice Control
    searchInventoryByVoice(houseId: ID!, searchTerm: String!): [InventorySearchResult!]!
  }

  # Mutations
  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!
    
    # User Profile
    updateUserProfile(input: UpdateUserProfileInput!): User!
    updateUserPreferences(input: UpdateUserPreferencesInput!): Boolean!

    # Houses
    createHouse(input: CreateHouseInput!): House!
    updateHouse(id: ID!, input: UpdateHouseInput!): House!
    deleteHouse(id: ID!): Boolean!
    
    # House Sharing
    createHouseInvitation(input: CreateHouseInvitationInput!): HouseInvitationResult!
    acceptHouseInvitation(input: AcceptHouseInvitationInput!): House!
    revokeHouseInvitation(invitationId: ID!): Boolean!
    removeHouseShare(shareId: ID!): Boolean!
    updateHouseShareRole(shareId: ID!, role: HouseRole!): HouseShare!

    # Inventory
    createInventoryItem(input: CreateInventoryItemInput!): InventoryItem!
    createInventoryItems(input: CreateInventoryItemsInput!): BulkInventoryResult!
    updateInventoryItem(id: ID!, input: UpdateInventoryItemInput!): InventoryItem!
    deleteInventoryItem(id: ID!): Boolean!

    # AI
    scanImage(input: AIImageScanInput!): AIScan!
    processAIScan(scanId: ID!): JSON!

    # Voice Control
    processVoiceIntent(transcript: String!, houseId: ID!): VoiceIntent!
    updateInventoryByVoice(houseId: ID!, itemName: String!, quantity: Float!): VoiceUpdateResult!
    generateMissingInfoSpeech(missingInfo: [String!]!): SpeechGenerationResult!
    generateSimpleSpeech(text: String!): SpeechGenerationResult!

    # Kitchen Timer
    createTimer(input: CreateKitchenTimerInput!): KitchenTimer!
    updateTimer(id: ID!, input: UpdateKitchenTimerInput!): KitchenTimer!
    deleteTimer(id: ID!): Boolean!
    startTimer(id: ID!): KitchenTimer!
    pauseTimer(id: ID!): KitchenTimer!
    stopTimer(id: ID!): KitchenTimer!
    resetTimer(id: ID!): KitchenTimer!
    createTimerFromPreset(presetName: String!, customName: String): KitchenTimer!
    bulkStopTimers(timerIds: [ID!]!): Int!
  }
`;