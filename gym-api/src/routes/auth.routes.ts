import { Router, Request, Response, NextFunction } from 'express';
import { login, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rota protegida para registro de instrutores (apenas admin pode registrar)
router.post(
  '/register-instructor',
  authMiddleware(['admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    // Forçar userType = 'instructor' ao registrar via esta rota
    req.body = { ...(req.body || {}), userType: 'instructor' };
    return register(req, res);
  }
);

export default router;
