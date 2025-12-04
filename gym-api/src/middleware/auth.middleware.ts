import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';

// Definir a interface para o payload do JWT
interface JwtPayload {
  userId: number;
  userType: UserRole;
  instructorId?: number;
}

// Extender a interface Request do Express para incluir a propriedade user
declare global {
  namespace Express {
    interface Request {
      user?: User | {
        id: number;
        userType: UserRole;
        instructorId?: number;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se o token está presente no cabeçalho de autorização
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    // Verificar e decodificar o token JWT
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Extrair userId do payload (pode estar em { user: { id } } ou { userId })
    const userId = decoded?.user?.id || decoded?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Token inválido: ID do usuário não encontrado' });
    }

    // Verificar se o usuário existe no banco de dados
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'userType', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Adicionar o usuário à requisição para uso posterior
    req.user = {
      id: user.id,
      userType: user.userType || 'student',
      instructorId: decoded?.instructorId
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Middleware para autorização baseada em funções
export const authMiddleware = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        message: 'Acesso negado. Permissões insuficientes.'
      });
    }

    next();
  };
};
export const authorizeRoles = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
};
