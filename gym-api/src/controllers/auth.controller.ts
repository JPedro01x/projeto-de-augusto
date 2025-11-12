import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, userType = 'student' } = req.body;

    const repo = AppDataSource.getRepository(User);
    const exists = await repo.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = repo.create({ name, email, passwordHash, userType, status: 'active' });
    await repo.save(user);

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
    
    // Usar uma função de callback para evitar problemas de tipagem
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        { user: { id: user.id, userType: user.userType } },
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
        userType: user.userType,
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
    
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email } });
    
    if (!user) {
      console.error('Usuário não encontrado:', email);
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    console.log('Usuário encontrado, verificando senha...');
    const ok = await bcrypt.compare(password, user.passwordHash);
    
    if (!ok) {
      console.error('Senha incorreta para o usuário:', email);
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }
    
    console.log('Login bem-sucedido para o usuário:', user.id);

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
    
    // Usar uma função de callback para evitar problemas de tipagem
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign(
        { user: { id: user.id, userType: user.userType } },
        jwtSecret,
        { expiresIn: jwtExpiresIn } as jwt.SignOptions,
        (err, token) => {
          if (err) reject(err);
          else if (!token) reject(new Error('Token not generated'));
          else resolve(token);
        }
      );
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};
