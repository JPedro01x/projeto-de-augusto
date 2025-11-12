import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware';

const router = Router();

// Rota para obter estatísticas do dashboard (protegida por autenticação)
router.get('/stats', authenticateToken, getDashboardStats);

export default router;
