import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  static async sendNotification(userId: string, type: string, title: string, message: string, data?: any) {
    try {
      // Get user preferences for notifications
      const userPrefs = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      // Check if user wants this type of notification
      const shouldSend = this.shouldSendNotification(type, userPrefs);
      
      if (!shouldSend) {
        return false;
      }

      // For now, just log the notification since we don't have a notification table
      console.log(`Notification for user ${userId}: ${title} - ${message}`);

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  private static shouldSendNotification(type: string, userPrefs: any): boolean {
    if (!userPrefs) return true; // Default to sending if no preferences

    switch (type) {
      case 'LOW_STOCK':
        return userPrefs.lowStockNotifications;
      case 'EXPIRY_WARNING':
        return userPrefs.expiryNotifications;
      default:
        return userPrefs.pushNotifications;
    }
  }

  static async getNotifications(userId: string, limit = 20, unreadOnly = false) {
    // Return empty array since we don't have notifications table
    return [];
  }

  static async markAsRead(notificationId: string) {
    // No-op since we don't have notifications table
    return true;
  }
}