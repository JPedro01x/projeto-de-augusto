import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

// Rota para obter estatísticas do dashboard
router.get('/stats', getDashboardStats);

// Rota básica para verificar se o dashboard está funcionando
router.get('/', (req, res) => {
  return res.json({ message: 'Dashboard route is working!' });
});

export { router as dashboardRouter };
