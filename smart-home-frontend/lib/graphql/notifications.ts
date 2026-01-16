import { gql } from '@apollo/client';

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!, $limit: Int = 50, $offset: Int = 0) {
    notifications(userId: $userId, limit: $limit, offset: $offset) {
      id
      title
      message
      type
      read
      actionUrl
      createdAt
      metadata {
        itemId
        itemName
        listId
        listName
        recipeId
        recipeName
        expiryDate
        quantity
      }
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query GetUnreadNotificationsCount($userId: ID!) {
    unreadNotificationsCount(userId: $userId)
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead($userId: ID!) {
    markAllNotificationsRead(userId: $userId) {
      success
      count
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      success
      message
    }
  }
`;

export const DELETE_ALL_NOTIFICATIONS = gql`
  mutation DeleteAllNotifications($userId: ID!) {
    deleteAllNotifications(userId: $userId) {
      success
      count
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      id
      title
      message
      type
      createdAt
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($userId: ID!, $settings: NotificationSettingsInput!) {
    updateNotificationSettings(userId: $userId, settings: $settings) {
      id
      expiryAlerts
      lowStockAlerts
      shoppingReminders
      mealPlanReminders
      pushNotifications
      emailNotifications
      smsNotifications
      quietHours {
        enabled
        startTime
        endTime
      }
      updatedAt
    }
  }
`;

export const GET_NOTIFICATION_SETTINGS = gql`
  query GetNotificationSettings($userId: ID!) {
    notificationSettings(userId: $userId) {
      id
      expiryAlerts
      lowStockAlerts
      shoppingReminders
      mealPlanReminders
      pushNotifications
      emailNotifications
      smsNotifications
      quietHours {
        enabled
        startTime
        endTime
      }
      categories {
        category
        enabled
        priority
      }
    }
  }
`;

export const REGISTER_PUSH_TOKEN = gql`
  mutation RegisterPushToken($userId: ID!, $token: String!, $platform: String!) {
    registerPushToken(userId: $userId, token: $token, platform: $platform) {
      success
      message
    }
  }
`;

export const UNREGISTER_PUSH_TOKEN = gql`
  mutation UnregisterPushToken($userId: ID!, $token: String!) {
    unregisterPushToken(userId: $userId, token: $token) {
      success
      message
    }
  }
`;

export const SEND_TEST_NOTIFICATION = gql`
  mutation SendTestNotification($userId: ID!, $type: String!) {
    sendTestNotification(userId: $userId, type: $type) {
      success
      message
    }
  }
`;

export const GET_NOTIFICATION_HISTORY = gql`
  query GetNotificationHistory($userId: ID!, $startDate: String!, $endDate: String!) {
    notificationHistory(userId: $userId, startDate: $startDate, endDate: $endDate) {
      id
      title
      message
      type
      read
      createdAt
      readAt
      actionTaken
      metadata {
        itemName
        listName
        recipeName
      }
    }
  }
`;

export const GET_NOTIFICATION_STATS = gql`
  query GetNotificationStats($userId: ID!, $period: String = "month") {
    notificationStats(userId: $userId, period: $period) {
      totalSent
      totalRead
      readRate
      averageReadTime
      typeBreakdown {
        type
        count
        readCount
        readRate
      }
      dailyStats {
        date
        sent
        read
      }
    }
  }
`;

export const SNOOZE_NOTIFICATION = gql`
  mutation SnoozeNotification($id: ID!, $snoozeUntil: String!) {
    snoozeNotification(id: $id, snoozeUntil: $snoozeUntil) {
      id
      snoozedUntil
      updatedAt
    }
  }
`;

export const UNSNOOZE_NOTIFICATION = gql`
  mutation UnsnoozeNotification($id: ID!) {
    unsnoozeNotification(id: $id) {
      id
      snoozedUntil
      updatedAt
    }
  }
`;

export const BULK_MARK_NOTIFICATIONS_READ = gql`
  mutation BulkMarkNotificationsRead($ids: [ID!]!) {
    bulkMarkNotificationsRead(ids: $ids) {
      success
      count
      updatedIds
    }
  }
`;

export const BULK_DELETE_NOTIFICATIONS = gql`
  mutation BulkDeleteNotifications($ids: [ID!]!) {
    bulkDeleteNotifications(ids: $ids) {
      success
      count
      deletedIds
    }
  }
`;

export const SUBSCRIBE_TO_NOTIFICATIONS = gql`
  subscription NotificationSubscription($userId: ID!) {
    notificationAdded(userId: $userId) {
      id
      title
      message
      type
      read
      createdAt
      metadata {
        itemName
        listName
        recipeName
      }
    }
  }
`;