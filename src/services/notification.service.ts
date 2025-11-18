import { apiRequest } from './api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'payment' | 'system' | 'alert';
  relatedId?: number;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      return await apiRequest<Notification[]>(`/notifications?userId=${userId}`);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  },

  async markAsRead(notificationId: number): Promise<void> {
    try {
      await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await apiRequest(`/notifications/mark-all-read?userId=${userId}`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  },
};
