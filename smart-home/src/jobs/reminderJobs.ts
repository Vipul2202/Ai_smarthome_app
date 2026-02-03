// Background jobs for processing reminders and automated tasks

import { prisma } from '../lib/prisma';
import { NotificationService } from '../services/notification';

export class ReminderJobProcessor {
  async processExpiredItems(): Promise<void> {
    try {
      // Since we don't have expiry dates in the current schema, this is a no-op
      console.log('Expiry processing not available in current schema');
    } catch (error) {
      console.error('Error processing expired items:', error);
    }
  }

  async processLowStockItems(): Promise<void> {
    try {
      // Find all inventory items with low quantities
      const items = await prisma.inventoryItem.findMany({
        where: {
          quantity: {
            lte: 1, // Consider items with 1 or less as low stock
          },
        },
        include: {
          house: {
            include: {
              user: true,
            },
          },
        },
      });

      for (const item of items) {
        // Send notification to house owner
        await NotificationService.sendNotification(
          item.house.userId,
          'LOW_STOCK',
          `${item.name} is running low`,
          `Only ${item.quantity} ${item.unit} left in ${item.house.name}`
        );
      }

      console.log(`Processed low stock check for ${items.length} items`);
    } catch (error) {
      console.error('Error processing low stock items:', error);
    }
  }

  async processScheduledReminders(): Promise<void> {
    try {
      // Since we don't have a reminders table, this is a no-op
      console.log('Scheduled reminders not available in current schema');
    } catch (error) {
      console.error('Error processing scheduled reminders:', error);
    }
  }
}

export const reminderJobProcessor = new ReminderJobProcessor();