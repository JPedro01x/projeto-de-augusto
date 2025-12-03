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

export const listStudents = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.query;
    
    let query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.cpf,
        u.phone,
        u.birth_date as birthDate,
        u.address,
        u.gender,
        u.status,
        s.plan_type as planType,
        s.start_date as startDate,
        s.end_date as endDate,
        s.emergency_contact_name as emergencyContact,
        s.emergency_contact_phone as emergencyContactPhone,
        s.health_conditions as medicalConditions,
        s.registration_date as registrationDate,
        s.created_at as createdAt,
        s.updated_at as updatedAt,
        s.payment_status as paymentStatus,
        s.last_payment_date as lastPaymentDate,
        s.next_payment_date as nextPaymentDate,
        s.avatar
      FROM users u
      JOIN students s ON u.id = s.user_id
      LEFT JOIN student_instructors si ON s.user_id = si.student_id
    `;

    const params: any[] = [];

    if (instructorId) {
      query += ` WHERE si.instructor_id = ?`;
      params.push(Number(instructorId));
    } else {
      query += ` WHERE u.user_type = 'student'`;
    }

    query += ` ORDER BY u.name ASC`;

    const students = await AppDataSource.query(query, params);

    // Format students response
    const formattedStudents = students.map((s: any) => ({
      id: s.id.toString(),
      userId: s.id,
      name: s.name || 'Não informado',
      email: s.email || 'Não informado',
      cpf: s.cpf || 'Não informado',
      phone: s.phone || 'Não informado',
      birthDate: s.birthDate || null,
      address: s.address || 'Não informado',
      gender: s.gender || 'not_specified',
      status: s.status || 'inactive',
      planType: s.planType || 'basic',
      startDate: s.startDate || null,
      endDate: s.endDate || null,
      emergencyContact: s.emergencyContact || 'Não informado',
      emergencyContactPhone: s.emergencyContactPhone || 'Não informado',
      medicalConditions: s.medicalConditions || 'Nenhuma condição médica informada',
      registrationDate: s.registrationDate?.toISOString?.() || new Date().toISOString(),
      paymentStatus: s.paymentStatus || 'pending',
      lastPaymentDate: s.lastPaymentDate?.toISOString?.() || null,
      nextPaymentDate: s.nextPaymentDate?.toISOString?.() || null,
      avatar: s.avatar || '/images/avatars/default-avatar.png',
      assignedInstructor: '',
      instructorName: 'Não atribuído',
      updatedAt: s.updatedAt?.toISOString?.() || new Date().toISOString(),
      age: s.birthDate ? 
        (new Date().getFullYear() - new Date(s.birthDate).getFullYear()) : null
    }));

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

export const debugStudentsWithInstructors = async (_req: Request, res: Response) => {
  try {
    const query = AppDataSource.createQueryBuilder()
      .select('u.id', 'student_id')
      .addSelect('u.name', 'student_name')
      .addSelect('u.email', 'student_email')
      .addSelect('s.instructor_id', 'instructor_id')
      .addSelect('ui.name', 'instructor_name')
      .from(User, 'u')
      .leftJoin(Student, 's', 's.user_id = u.id')
      .leftJoin(User, 'ui', 'ui.id = s.instructor_id')
      .where('u.user_type = :type', { type: 'student' })
      .orderBy('u.name', 'ASC');

    const results = await query.getRawMany();
    
    return res.json({
      total: results.length,
      students: results
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao debugar alunos:', error);
    return res.status(500).json({ 
      message: 'Erro ao debugar alunos',
      error: errorMessage
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
      planType,
      startDate,
      endDate,
      paymentStatus,
      lastPaymentDate,
      nextPaymentDate,
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
    if (planType !== undefined) student.planType = planType;
    if (startDate !== undefined) student.startDate = startDate;
    if (endDate !== undefined) student.endDate = endDate;
    if (paymentStatus !== undefined) student.paymentStatus = paymentStatus;
    if (lastPaymentDate !== undefined) student.lastPaymentDate = lastPaymentDate;
    if (nextPaymentDate !== undefined) student.nextPaymentDate = nextPaymentDate;
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
