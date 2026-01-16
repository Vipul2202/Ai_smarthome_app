import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  DELETE_NOTIFICATION,
  UPDATE_NOTIFICATION_SETTINGS
} from '@/lib/graphql/notifications';
import { Notification } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UseNotificationsProps {
  userId?: string;
}

export const useNotifications = ({ userId }: UseNotificationsProps = {}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    expiryAlerts: true,
    lowStockAlerts: true,
    shoppingReminders: true,
    mealPlanReminders: true,
    pushNotifications: true,
    emailNotifications: true,
  });

  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId },
    skip: !userId,
    errorPolicy: 'all',
    pollInterval: 30000, // Poll every 30 seconds for new notifications
  });

  const [markReadMutation] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [{ query: GET_NOTIFICATIONS, variables: { userId } }],
  });

  const [markAllReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: [{ query: GET_NOTIFICATIONS, variables: { userId } }],
  });

  const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION, {
    refetchQueries: [{ query: GET_NOTIFICATIONS, variables: { userId } }],
  });

  const [updateSettingsMutation] = useMutation(UPDATE_NOTIFICATION_SETTINGS);

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  // Group notifications by type
  const notificationsByType = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) acc[notification.type] = [];
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    // Listen for notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Refetch notifications to update the list
      refetch();
    });

    // Listen for notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap - navigate to relevant screen
      handleNotificationTap(response.notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      
      // Save token to storage and send to backend
      await AsyncStorage.setItem('expoPushToken', token);
      // TODO: Send token to backend to associate with user
      
    } catch (error) {
      console.error('Error getting push token:', error);
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        setNotificationSettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (settings: typeof notificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
      
      // Update settings on backend
      await updateSettingsMutation({
        variables: {
          userId,
          settings,
        },
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markReadMutation({
        variables: { id: notificationId },
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllReadMutation({
        variables: { userId },
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation({
        variables: { id: notificationId },
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error };
    }
  };

  const scheduleLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null,
      });
      return { success: true, id };
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return { success: false, error };
    }
  };

  const cancelLocalNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling notification:', error);
      return { success: false, error };
    }
  };

  const handleNotificationTap = (notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    
    // Handle different notification types
    switch (data?.type) {
      case 'expiry':
        // Navigate to inventory screen
        break;
      case 'low_stock':
        // Navigate to inventory screen
        break;
      case 'shopping_reminder':
        // Navigate to shopping screen
        break;
      case 'meal_plan':
        // Navigate to recipes screen
        break;
      default:
        // Navigate to notifications screen
        break;
    }
  };

  const createExpiryNotification = async (itemName: string, expiryDate: string) => {
    if (!notificationSettings.expiryAlerts) return;

    const expiryDateObj = new Date(expiryDate);
    const now = new Date();
    const diffInDays = Math.ceil((expiryDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays <= 1) {
      return scheduleLocalNotification(
        'Item Expiring Soon!',
        `${itemName} expires ${diffInDays === 0 ? 'today' : 'tomorrow'}`,
        { type: 'expiry', itemName, expiryDate }
      );
    }
  };

  const createLowStockNotification = async (itemName: string, quantity: number) => {
    if (!notificationSettings.lowStockAlerts) return;

    return scheduleLocalNotification(
      'Low Stock Alert',
      `${itemName} is running low (${quantity} remaining)`,
      { type: 'low_stock', itemName, quantity }
    );
  };

  const createShoppingReminder = async (listName: string, itemCount: number) => {
    if (!notificationSettings.shoppingReminders) return;

    return scheduleLocalNotification(
      'Shopping Reminder',
      `Don't forget your ${listName} list (${itemCount} items)`,
      { type: 'shopping_reminder', listName, itemCount }
    );
  };

  const createMealPlanReminder = async (mealName: string, mealTime: string) => {
    if (!notificationSettings.mealPlanReminders) return;

    return scheduleLocalNotification(
      'Meal Plan Reminder',
      `Time to prepare ${mealName} for ${mealTime}`,
      { type: 'meal_plan', mealName, mealTime }
    );
  };

  return {
    // Data
    notifications,
    unreadNotifications,
    readNotifications,
    notificationsByType,
    unreadCount,
    expoPushToken,
    notificationSettings,
    
    // State
    loading,
    error,
    
    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    saveNotificationSettings,
    scheduleLocalNotification,
    cancelLocalNotification,
    createExpiryNotification,
    createLowStockNotification,
    createShoppingReminder,
    createMealPlanReminder,
    refetch,
    
    // Setters
    setNotificationSettings,
  };
};