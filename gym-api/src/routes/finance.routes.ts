import { Router } from 'express';
import { 
  getFinancialSummary, 
  getPayments, 
  getPaymentById, 
  createPayment, 
  updatePayment, 
  deletePayment,
  requestPayment
} from '../controllers/finance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Rotas de finanças (apenas para administradores)

// Resumo financeiro
router.get('/summary', authenticateToken, getFinancialSummary);

// Rotas de pagamentos
router.get('/payments', authenticateToken, getPayments);
router.get('/payments/:id', authenticateToken, getPaymentById);
router.post('/payments', authenticateToken, createPayment);
router.put('/payments/:id', authenticateToken, updatePayment);
router.delete('/payments/:id', authenticateToken, deletePayment);

// Rota para solicitar um novo pagamento (criar cobrança)
router.post('/request-payment', authenticateToken, requestPayment);

export default router;
