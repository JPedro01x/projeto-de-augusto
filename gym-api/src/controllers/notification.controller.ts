import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário é obrigatório' 
      });
    }

    const notificationRepository = AppDataSource.getRepository(Notification);
    
    const userIdNumber = parseInt(userId as string, 10);
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário inválido' 
      });
    }

    const notifications = await notificationRepository.find({
      where: { userId: userIdNumber },
      order: { createdAt: 'DESC' },
      take: 50 // Limita a 50 notificações mais recentes
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar notificações' 
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notification = await notificationRepository.findOne({ 
      where: { id: parseInt(id) } 
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notificação não encontrada' 
      });
    }
    
    notification.read = true;
    await notificationRepository.save(notification);
    
    res.status(200).json({ 
      success: true,
      message: 'Notificação marcada como lida com sucesso',
      notification 
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao marcar notificação como lida' 
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário é obrigatório' 
      });
    }
    
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    const userIdNumber = parseInt(userId as string, 10);
    if (isNaN(userIdNumber)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID do usuário inválido' 
      });
    }
    
    // Atualiza todas as notificações não lidas do usuário
    await notificationRepository.update(
      { userId: userIdNumber, read: false },
      { read: true }
    );
    
    res.status(200).json({ 
      success: true,
      message: 'Todas as notificações foram marcadas como lidas' 
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao marcar notificações como lidas' 
    });
  }
};

export const createNotification = async (
  userId: number, 
  title: string, 
  message: string, 
  type: 'payment' | 'system' | 'alert',
  relatedId?: number
) => {
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    
    const notification = new Notification();
    notification.userId = userId;
    notification.title = title;
    notification.message = message;
    notification.type = type;
    notification.relatedId = relatedId;
    notification.read = false;
    
    await notificationRepository.save(notification);
    return notification;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return null;
  }
};
