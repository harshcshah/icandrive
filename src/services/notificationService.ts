/**
 * Notifications Service for learner lesson reminders and payment alerts
 */
import { Storage } from './storage';
import { NotificationItem } from '../types';

export const NotificationService = {
  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    const notifs = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    return notifs.filter((n) => n.user_id === userId);
  },

  async markAsRead(notifId: string): Promise<void> {
    const notifs = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    const idx = notifs.findIndex((n) => n.id === notifId);
    if (idx !== -1) {
      notifs[idx].read = true;
      Storage.set(Storage.KEYS.NOTIFICATIONS, notifs);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const notifs = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    const updated = notifs.map((n) => (n.user_id === userId ? { ...n, read: true } : n));
    Storage.set(Storage.KEYS.NOTIFICATIONS, updated);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const notifs = Storage.get<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS, []);
    return notifs.filter((n) => n.user_id === userId && !n.read).length;
  },
};
