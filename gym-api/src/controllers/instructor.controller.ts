import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Instructor } from '../entities/Instructor';
import { MoreThanOrEqual } from 'typeorm';
import bcrypt from 'bcrypt';

export const listInstructors = async (_req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const instructors = await userRepo.find({ 
      where: { userType: 'instructor', status: 'active' },
      relations: ['instructor']
    });
    
    // Retorna apenas campos necessários ao frontend
    return res.json(
      instructors.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        cpf: u.cpf,
        specialty: u.instructor?.specialty,
        certifications: u.instructor?.certifications,
        schedule: 'Seg a Sex: 08:00 - 18:00', // Valor padrão, ajuste conforme necessário
        activeStudents: 0 // Será calculado posteriormente
      }))
    );
  } catch (error) {
    console.error('Erro ao listar instrutores:', error);
    return res.status(500).json({ message: 'Erro ao listar instrutores' });
  }
};

export const createInstructor = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    const { name, email, password, phone, cpf, specialty, certifications, schedule } = req.body;
    
    // Validação básica
    if (!name || !email || !password || !cpf) {
      return res.status(400).json({ message: 'Nome, email, senha e CPF são obrigatórios' });
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userRepo = queryRunner.manager.getRepository(User);
    const instructorRepo = queryRunner.manager.getRepository(Instructor);

    // Verifica se o email já está em uso
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Criptografa a senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Cria o usuário
    const user = userRepo.create({
      name,
      email,
      passwordHash: hashedPassword,
      cpf,
      phone: phone || null,
      userType: 'instructor',
      status: 'active'
    });

    await queryRunner.manager.save(user);

    // Cria o instrutor
    const instructor = instructorRepo.create({
      userId: user.id,
      specialty: specialty || 'Treinamento Personalizado',
      certifications: certifications || 'Sem certificações informadas',
      hireDate: new Date()
    });

    await queryRunner.manager.save(instructor);
    await queryRunner.commitTransaction();

    // Retorna os dados do instrutor criado (sem a senha)
    const { passwordHash, ...userData } = user;
    return res.status(201).json({
      ...userData,
      instructor: {
        specialty: instructor.specialty,
        certifications: instructor.certifications,
        hireDate: instructor.hireDate,
        schedule: schedule || 'Seg a Sex: 08:00 - 18:00'
      },
      activeStudents: 0
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Erro ao criar instrutor:', error);
    return res.status(500).json({ message: 'Erro ao criar instrutor' });
  } finally {
    await queryRunner.release();
  }
};
