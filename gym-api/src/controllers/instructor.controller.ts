import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

export const listInstructors = async (_req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(User);
  const instructors = await repo.find({ where: { userType: 'instructor', status: 'active' } });
  // Retorna apenas campos necessários ao frontend
  return res.json(
    instructors.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      cpf: u.cpf,
    }))
  );
};
