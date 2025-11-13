import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Student } from '../entities/Student';
import bcrypt from 'bcryptjs';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, cpf, phone, birthDate, address, emergencyContactName, emergencyContactPhone } = req.body;

    // create user as student
    const userRepo = AppDataSource.getRepository(User);
    const studentRepo = AppDataSource.getRepository(Student);

    const exists = await userRepo.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const passwordHash = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('123456', 10);

    // Criar e salvar o usuário primeiro
    const user = new User();
    user.name = name;
    user.email = email;
    user.passwordHash = passwordHash;
    user.cpf = cpf;
    user.phone = phone;
    user.birthDate = birthDate;
    user.address = address;
    user.userType = 'student';
    user.status = 'active';
    
    const savedUser = await userRepo.save(user);
    
    // Criar e salvar o estudante
    const student = new Student();
    student.user = savedUser;
    student.emergencyContactName = emergencyContactName;
    student.emergencyContactPhone = emergencyContactPhone;
    
    await studentRepo.save(student);
    
    return res.status(201).json({ id: savedUser.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const listStudents = async (_req: Request, res: Response) => {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    // Primeiro, buscamos os alunos sem selecionar colunas específicas para evitar erros
    const students = await studentRepo.find({ 
      relations: { 
        user: true,
        instructor: { user: true }
      }
    });

    // Mapear os dados para o formato esperado pelo frontend
    const formattedStudents = students
      .map(student => {
        if (!student.user) {
          console.error('User not found for student:', student.userId);
          return null;
        }

        // Garantir que todos os campos necessários estejam presentes
        return {
          id: student.user.id.toString(),
          userId: student.user.id,
          name: student.user.name || 'Não informado',
          email: student.user.email || 'Não informado',
          cpf: student.user.cpf || 'Não informado',
          phone: student.user.phone || 'Não informado',
          birthDate: student.user.birthDate || null,
          address: student.user.address || 'Não informado',
          gender: student.gender || student.user.gender || 'not_specified',
          status: student.user.status || 'inactive',
          planType: student.planType || 'basic',
          startDate: student.startDate || null,
          endDate: student.endDate || null,
          emergencyContact: student.emergencyContactName || 'Não informado',
          emergencyContactPhone: student.emergencyContactPhone || 'Não informado',
          medicalConditions: student.healthConditions || 'Nenhuma condição médica informada',
          registrationDate: student.registrationDate || student.createdAt?.toISOString() || new Date().toISOString(),
          paymentStatus: student.paymentStatus || 'pending',
          lastPaymentDate: student.lastPaymentDate?.toISOString() || null,
          nextPaymentDate: student.nextPaymentDate?.toISOString() || null,
          avatar: student.avatar || '/images/avatars/default-avatar.png',
          assignedInstructor: student.instructor ? student.instructor.userId.toString() : '',
          instructorName: student.instructor?.user?.name || 'Não atribuído',
          updatedAt: student.updatedAt?.toISOString() || new Date().toISOString(),
          age: student.user.birthDate ? 
            (new Date().getFullYear() - new Date(student.user.birthDate).getFullYear()) : null
        };
      })
      .filter((student): student is NonNullable<typeof student> => student !== null);

    return res.json(formattedStudents);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao listar alunos:', error);
    return res.status(500).json({ 
      message: 'Erro ao listar alunos',
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id do user
    const {
      name,
      email,
      password,
      cpf,
      phone,
      birthDate,
      address,
      emergencyContactName,
      emergencyContactPhone,
      status,
    } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const studentRepo = AppDataSource.getRepository(Student);

    const user = await userRepo.findOne({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Student not found' });

    // Atualiza User
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (cpf !== undefined) user.cpf = cpf;
    if (phone !== undefined) user.phone = phone;
    if (birthDate !== undefined) user.birthDate = birthDate;
    if (address !== undefined) user.address = address;
    if (status !== undefined) user.status = status;
    // Atualiza senha se enviada
    if (password !== undefined && password !== null && String(password).length > 0) {
      user.passwordHash = await bcrypt.hash(String(password), 10);
    }
    await userRepo.save(user);

    // Atualiza Student
    let student = await studentRepo.findOne({ where: { userId: Number(id) } });
    if (!student) {
      student = studentRepo.create({ userId: Number(id) });
    }
    if (emergencyContactName !== undefined) student.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) student.emergencyContactPhone = emergencyContactPhone;
    await studentRepo.save(student);

    const result = await studentRepo.findOne({ where: { userId: Number(id) }, relations: { user: true } });
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id do user
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Student not found' });

    await userRepo.remove(user); // cascade remove em Student
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
};
