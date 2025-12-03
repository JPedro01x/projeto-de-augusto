import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '@/services/notification.service';
import { useAuth } from '@/context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar notificações'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(n => (n.read ? n : { ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
      throw err;
    }
  }, [user?.id]);

  // Carregar notificações ao montar o componente e quando o usuário mudar
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
