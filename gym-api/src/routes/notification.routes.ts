import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Rotas de notificações
router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/mark-all-read', authenticateToken, markAllAsRead);

export default router;
