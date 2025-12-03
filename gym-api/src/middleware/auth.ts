import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Verificando autenticação...');
  console.log('[AUTH] Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'não fornecido');

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) {
        console.error('[AUTH] Erro ao verificar token:', err.message);
        return res.status(403).json({ message: 'Token inválido ou expirado', error: err.message });
      }

      try {
        console.log('[AUTH] Token decodificado:', decoded);
        // O payload pode vir como { user: { id, role } } ou { userId, userType }
        const userId = decoded?.user?.id || decoded?.userId;
        console.log('[AUTH] UserID extraído:', userId);
        
        if (!userId) {
          console.error('[AUTH] ID do usuário não encontrado no token');
          return res.status(401).json({ message: 'Token inválido: ID do usuário não encontrado' });
        }

        const userRepository = AppDataSource.getRepository(User);
        const userData = await userRepository.findOne({ where: { id: userId } });
        
        if (!userData) {
          console.error('[AUTH] Usuário não encontrado no DB:', userId);
          return res.status(401).json({ message: 'Usuário não encontrado' });
        }

        console.log('[AUTH] Autenticação OK para usuário:', userData.id);
        req.user = userData;
        next();
      } catch (error) {
        console.error('[AUTH] Erro ao buscar usuário:', error);
        return res.status(500).json({ message: 'Erro interno' });
      }
    });
  } else {
    console.error('[AUTH] Header de autorização não fornecido');
    res.status(401).json({ message: 'Token não fornecido' });
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
