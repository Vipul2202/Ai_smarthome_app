import { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATION_COUNT
} from '@/lib/graphql/queries';
import {
  MARK_NOTIFICATION_AS_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION,
  DELETE_NOTIFICATION_MUTATION,
  DELETE_ALL_NOTIFICATIONS_MUTATION,
  SEND_TEST_NOTIFICATION_MUTATION,
  UPDATE_NOTIFICATION_PREFERENCES_MUTATION
} from '@/lib/graphql/mutations';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'EXPIRY_WARNING' | 'LOW_STOCK' | 'SHOPPING_REMINDER' | 'MEAL_PLAN_REMINDER' | 'TIMER_COMPLETE' | 'WASTE_GOAL_EXCEEDED' | 'NUTRITION_GOAL_ACHIEVED' | 'SYSTEM_UPDATE' | 'GENERAL';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  expiryWarnings: boolean;
  lowStockAlerts: boolean;
  shoppingReminders: boolean;
  mealPlanReminders: boolean;
  timerAlerts: boolean;
  wasteGoalAlerts: boolean;
  nutritionGoalAlerts: boolean;
}

export function useNotifications() {
  const apolloClient = useApolloClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Queries
  const { 
    data: notificationsData, 
    loading: notificationsLoading, 
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery(GET_NOTIFICATIONS, {
    variables: {
      limit: 50,
      unreadOnly: showUnreadOnly
    },
    errorPolicy: 'all',
    pollInterval: 30000 // Poll every 30 seconds for new notifications
  });

  const { 
    data: unreadCountData, 
    loading: countLoading, 
    error: countError,
    refetch: refetchUnreadCount
  } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
    errorPolicy: 'all',
    pollInterval: 30000 // Poll every 30 seconds
  });

  // Mutations
  const [markAsRead] = useMutation(MARK_NOTIFICATION_AS_READ_MUTATION, {
    onCompleted: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
    onError: (error) => {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    }
  });

  const [markAllAsRead] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Marked ${data.markAllNotificationsAsRead} notifications as read`);
      refetchNotifications();
      refetchUnreadCount();
    },
    onError: (error) => {
      toast.error(`Failed to mark all notifications as read: ${error.message}`);
    }
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION_MUTATION, {
    onCompleted: () => {
      toast.success('Notification deleted');
      refetchNotifications();
      refetchUnreadCount();
    },
    onError: (error) => {
      toast.error(`Failed to delete notification: ${error.message}`);
    }
  });

  const [deleteAllNotifications] = useMutation(DELETE_ALL_NOTIFICATIONS_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Deleted ${data.deleteAllNotifications} notifications`);
      refetchNotifications();
      refetchUnreadCount();
    },
    onError: (error) => {
      toast.error(`Failed to delete all notifications: ${error.message}`);
    }
  });

  const [sendTestNotification] = useMutation(SEND_TEST_NOTIFICATION_MUTATION, {
    onCompleted: () => {
      toast.success('Test notification sent');
      refetchNotifications();
      refetchUnreadCount();
    },
    onError: (error) => {
      toast.error(`Failed to send test notification: ${error.message}`);
    }
  });

  const [updatePreferences] = useMutation(UPDATE_NOTIFICATION_PREFERENCES_MUTATION, {
    onCompleted: () => {
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    }
  });

  // Helper functions
  const markNotificationAsRead = async (id: string) => {
    try {
      await markAsRead({
        variables: { id }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotificationById = async (id: string) => {
    try {
      await deleteNotification({
        variables: { id }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotificationsAction = async () => {
    try {
      await deleteAllNotifications();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  const sendTestNotificationAction = async (title?: string, message?: string) => {
    try {
      await sendTestNotification({
        variables: { 
          title: title || 'Test Notification',
          message: message || 'This is a test notification from Smart Kitchen Manager.'
        }
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const updateNotificationPreferences = async (preferences: NotificationPreferences) => {
    try {
      await updatePreferences({
        variables: { preferences }
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  // Browser notification functions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Browser notifications enabled');
      } else if (permission === 'denied') {
        toast.error('Browser notifications denied');
      }
      
      return permission;
    }
    return 'denied';
  };

  const showBrowserNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
    return null;
  };

  // Service Worker push notifications (for PWA)
  const subscribeToPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });

        // Send subscription to server
        console.log('Push subscription:', subscription);
        toast.success('Push notifications enabled');
        
        return subscription;
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        toast.error('Failed to enable push notifications');
        return null;
      }
    }
    return null;
  };

  // Notification type helpers
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'EXPIRY_WARNING':
        return '⚠️';
      case 'LOW_STOCK':
        return '📦';
      case 'SHOPPING_REMINDER':
        return '🛒';
      case 'MEAL_PLAN_REMINDER':
        return '🍽️';
      case 'TIMER_COMPLETE':
        return '⏰';
      case 'WASTE_GOAL_EXCEEDED':
        return '🗑️';
      case 'NUTRITION_GOAL_ACHIEVED':
        return '🎯';
      case 'SYSTEM_UPDATE':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'EXPIRY_WARNING':
      case 'WASTE_GOAL_EXCEEDED':
        return 'text-red-600';
      case 'LOW_STOCK':
        return 'text-orange-600';
      case 'SHOPPING_REMINDER':
      case 'MEAL_PLAN_REMINDER':
        return 'text-blue-600';
      case 'TIMER_COMPLETE':
        return 'text-purple-600';
      case 'NUTRITION_GOAL_ACHIEVED':
        return 'text-green-600';
      case 'SYSTEM_UPDATE':
        return 'text-gray-600';
      default:
        return 'text-primary';
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return groups;
  };

  // Get relative time string
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return {
    // Data
    notifications: notificationsData?.notifications || [],
    unreadCount: unreadCountData?.unreadNotificationCount || 0,
    groupedNotifications: groupNotificationsByDate(notificationsData?.notifications || []),
    
    // Loading states
    loading: notificationsLoading || countLoading,
    notificationsLoading,
    countLoading,
    
    // Error states
    error: notificationsError || countError,
    notificationsError,
    countError,
    
    // Filters
    showUnreadOnly,
    setShowUnreadOnly,
    
    // Browser notification state
    notificationPermission,
    
    // Actions
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    deleteAllNotificationsAction,
    sendTestNotificationAction,
    updateNotificationPreferences,
    
    // Browser notifications
    requestNotificationPermission,
    showBrowserNotification,
    subscribeToPushNotifications,
    
    // Utilities
    getNotificationIcon,
    getNotificationColor,
    getRelativeTime,
    
    // Refetch functions
    refetchNotifications,
    refetchUnreadCount
  };
}