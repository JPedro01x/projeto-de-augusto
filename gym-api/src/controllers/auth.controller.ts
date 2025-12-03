import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
<<<<<<< HEAD
import { User, UserRole } from '../entities/User';
=======
import { User } from '../entities/User';
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  cpf?: string;
  phone?: string;
  instructor?: {
    specialty?: string;
    hireDate?: Date;
    certifications?: string;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    const repo = AppDataSource.getRepository(User);
    const exists = await repo.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = repo.create({ 
      name, 
      email, 
      password: passwordHash, 
<<<<<<< HEAD
      role: role as UserRole, 
=======
      role: role, 
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
      isActive: true 
    });
    await repo.save(user);

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
    
    // Usar uma função de callback para evitar problemas de tipagem
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        { user: { id: user.id, role: user.role } },
        jwtSecret,
        { expiresIn: jwtExpiresIn } as jwt.SignOptions,
        (err, token) => {
          if (err) reject(err);
          else if (!token) reject(new Error('Token not generated'));
          else resolve(token);
        }
      );
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Recebida requisição de login:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.error('Email ou senha não fornecidos');
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    console.log('Procurando usuário no banco de dados...');
    const userRepo = AppDataSource.getRepository(User);
<<<<<<< HEAD
    let userRaw: any;
    try {
      // Selecionar explicitamente os nomes das colunas no banco
      userRaw = await userRepo
        .createQueryBuilder('user')
        .select('user.id', 'id')
        .addSelect('user.name', 'name')
        .addSelect('user.email', 'email')
        .addSelect('user.password_hash', 'password_hash')
        .addSelect('user.user_type', 'role')
        .addSelect('user.cpf', 'cpf')
        .addSelect('user.phone', 'phone')
        .where('user.email = :email', { email })
        .getRawOne();
      console.log('Resultado da busca:', userRaw ? 'Usuário encontrado' : 'Usuário não encontrado');
=======
    let user;
    try {
      user = await userRepo.findOne({ 
        where: { email }
      });
      console.log('Resultado da busca:', user ? 'Usuário encontrado' : 'Usuário não encontrado');
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
    } catch (error) {
      const dbError = error as Error;
      console.error('Erro ao buscar usuário no banco de dados:', dbError);
      return res.status(500).json({ message: 'Erro ao buscar usuário', error: dbError.message });
    }
    
<<<<<<< HEAD
    if (!userRaw) {
=======
    if (!user) {
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
      console.error('Usuário não encontrado:', email);
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    console.log('Usuário encontrado, verificando senha...');
    let passwordMatch = false;
    try {
<<<<<<< HEAD
      passwordMatch = await bcrypt.compare(password, userRaw.password_hash);
=======
      passwordMatch = await bcrypt.compare(password, user.password);
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
      console.log('Resultado da comparação de senha:', passwordMatch ? 'Senha correta' : 'Senha incorreta');
    } catch (error) {
      const bcryptError = error as Error;
      console.error('Erro ao comparar senhas:', bcryptError);
      return res.status(500).json({ message: 'Erro ao verificar senha', error: bcryptError.message });
    }
    
    if (!passwordMatch) {
      console.error('Senha incorreta para o usuário:', email);
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }
    
<<<<<<< HEAD
    console.log('Login bem-sucedido para o usuário:', userRaw.id);
=======
    console.log('Login bem-sucedido para o usuário:', user.id);
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
    
    console.log('Gerando token JWT...');
    try {
      const token = await new Promise<string>((resolve, reject) => {
        jwt.sign(
<<<<<<< HEAD
          { user: { id: userRaw.id, role: userRaw.role } },
=======
          { user: { id: user.id, role: user.role } },
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
          jwtSecret,
          { expiresIn: jwtExpiresIn } as jwt.SignOptions,
          (err, token) => {
            if (err) {
              console.error('Erro ao gerar token JWT:', err);
              reject(err);
            } else if (!token) {
              const error = new Error('Token not generated');
              console.error(error);
              reject(error);
            } else {
              console.log('Token JWT gerado com sucesso');
              resolve(token);
            }
          }
        );
      });

      const response: { token: string; user: UserResponse } = {
        token,
        user: {
<<<<<<< HEAD
          id: userRaw.id,
          name: userRaw.name,
          email: userRaw.email,
          role: userRaw.role,
          ...(userRaw.cpf && { cpf: userRaw.cpf }),
          ...(userRaw.phone && { phone: userRaw.phone }),
        },
      };

      console.log('Login concluído com sucesso para o usuário:', userRaw.email);
=======
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...(user.cpf && { cpf: user.cpf }),
          ...(user.phone && { phone: user.phone }),
        },
      };

      console.log('Login concluído com sucesso para o usuário:', user.email);
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
      return res.json(response);
    } catch (error) {
      const tokenError = error as Error;
      console.error('Erro durante a geração do token:', tokenError);
      return res.status(500).json({ 
        message: 'Erro ao gerar token de autenticação',
        error: tokenError.message 
      });
    }
  } catch (error) {
    const e = error as Error;
    console.error('Erro inesperado no login:', e);
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: e.message,
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};
