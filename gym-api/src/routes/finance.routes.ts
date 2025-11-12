import { Router } from 'express';
import { getFinancialSummary, getPayments } from '../controllers/finance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Rotas de finanças (apenas admin)
// Rotas de finanças (apenas para administradores)
router.get('/summary', authenticateToken, getFinancialSummary);
router.get('/payments', authenticateToken, getPayments);

export default router;
