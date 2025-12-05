import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Student } from '../entities/Student';
import { Notification } from '../entities/Notification';
import bcrypt from 'bcryptjs';

const PLAN_PRICES: Record<string, number> = {
  mensal: 99.9,
  trimestral: 279.9,
  semestral: 539.9,
  anual: 999.9,
  basic: 99.9,
  premium: 149.9,
  vip: 199.9
};

export const checkOverduePayments = async (req: Request, res: Response) => {
  try {
    const studentRepo = AppDataSource.getRepository(Student);
    const notificationRepo = AppDataSource.getRepository(Notification);

    const today = new Date();

    // Buscar alunos com pagamentos vencidos (nextPaymentDate <= hoje) e status 'paid'
    const overdueStudents = await studentRepo.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .where('student.nextPaymentDate <= :today', { today })
      .andWhere('student.paymentStatus = :status', { status: 'paid' })
      .getMany();

    let processedCount = 0;

    for (const student of overdueStudents) {
      // Atualizar status para overdue
      student.paymentStatus = 'overdue';
      await studentRepo.save(student);

      // Criar notificação
      // Criar notificação
      const planType = student.planType?.toLowerCase() || 'basic';
      const planPrice = PLAN_PRICES[planType] || 0;
      const formattedPrice = planPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      const notification = new Notification();
      notification.title = 'Pagamento em Atraso';
      notification.message = `O plano ${student.planType} de ${student.user.name} venceu. Valor em aberto: ${formattedPrice}`;
      notification.type = 'payment';
      notification.userId = student.user.id;
      notification.relatedId = student.userId; // PK do student é userId

      await notificationRepo.save(notification);
      processedCount++;
    }

    return res.json({
      message: 'Verificação de pagamentos atrasados concluída',
      processed: processedCount
    });
  } catch (error) {
    console.error('Erro ao verificar pagamentos atrasados:', error);
    return res.status(500).json({ message: 'Erro ao verificar pagamentos atrasados' });
  }
};

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
    user.password = passwordHash;
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
      gender,
      emergencyContactName,
      emergencyContactPhone,
      status,
      planType,
      startDate,
      endDate,
      paymentStatus,
      lastPaymentDate,
      nextPaymentDate,
      paymentMethod,
      amountPaid,
      height,
      weight,
    } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const studentRepo = AppDataSource.getRepository(Student);

    console.log('=== UPDATE STUDENT ===');
    console.log('ID:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check what fields are being updated
    const fieldsBeingUpdated = Object.keys(req.body).filter(key => req.body[key] !== undefined);
    console.log('Fields being updated:', fieldsBeingUpdated);

    const user = await userRepo.findOne({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Student not found' });

    // Verifica se há campos de usuário para atualizar
    const hasUserUpdates = name !== undefined || email !== undefined || cpf !== undefined ||
      phone !== undefined || birthDate !== undefined || address !== undefined ||
      status !== undefined || gender !== undefined || (password !== undefined && password !== null && String(password).length > 0);

    if (hasUserUpdates) {
      // Atualiza User
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (cpf !== undefined) user.cpf = cpf;
      if (phone !== undefined) user.phone = phone;
      if (birthDate !== undefined) {
        // Convert to Date object if it's a string, and extract only the date part
        const dateValue = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
        // Fix: Send only YYYY-MM-DD to avoid MySQL error with ISO string
        user.birthDate = dateValue.toISOString().split('T')[0] as any;
      }
      if (address !== undefined) user.address = address;
      if (status !== undefined) user.status = status;
      if (gender !== undefined) user.gender = gender;
      // Atualiza senha se enviada
      if (password !== undefined && password !== null && String(password).length > 0) {
        user.password = await bcrypt.hash(String(password), 10);
      }
      await userRepo.save(user);
    }

    // Atualiza Student
    let student = await studentRepo.findOne({ where: { userId: Number(id) } });

    if (!student) {
      // Se não existir, cria um novo (caso raro de inconsistência)
      student = studentRepo.create({ userId: Number(id) });
      // Para novo registro, usamos save
      if (emergencyContactName !== undefined) student.emergencyContactName = emergencyContactName;
      if (emergencyContactPhone !== undefined) student.emergencyContactPhone = emergencyContactPhone;
      if (planType !== undefined) student.planType = planType;
      if (startDate !== undefined) {
        const date = new Date(startDate);
        student.startDate = date.toISOString().split('T')[0] as any;
      }
      if (endDate !== undefined) {
        const date = new Date(endDate);
        student.endDate = date.toISOString().split('T')[0] as any;
      }
      if (paymentStatus !== undefined) student.paymentStatus = paymentStatus;
      if (paymentMethod !== undefined) student.paymentMethod = paymentMethod;
      if (height !== undefined) student.height = height ? parseFloat(height) : undefined;
      if (weight !== undefined) student.weight = weight ? parseFloat(weight) : undefined;

      await studentRepo.save(student);
    } else {
      // Se já existe, usamos update para evitar problemas com relações (User)
      const updateData: any = {};

      if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName;
      if (emergencyContactPhone !== undefined) updateData.emergencyContactPhone = emergencyContactPhone;
      if (planType !== undefined) updateData.planType = planType;
      if (startDate !== undefined) {
        const date = new Date(startDate);
        updateData.startDate = date.toISOString().split('T')[0];
      }
      if (endDate !== undefined) {
        const date = new Date(endDate);
        updateData.endDate = date.toISOString().split('T')[0];
      }
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
      if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
      if (height !== undefined) updateData.height = height ? parseFloat(height) : undefined;
      if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : undefined;

      // Se amountPaid foi enviado, atualiza lastPaymentDate e calcula nextPaymentDate
      if (amountPaid !== undefined) {
        updateData.amountPaid = parseFloat(amountPaid);
        const paymentDate = lastPaymentDate ? new Date(lastPaymentDate) : new Date();
        // Fix: Send only YYYY-MM-DD to avoid MySQL error with ISO string
        updateData.lastPaymentDate = paymentDate.toISOString().split('T')[0];

        // Calcula a próxima data de pagamento baseada no planType
        const currentPlanType = planType || student.planType;
        if (currentPlanType) {
          const nextDate = new Date(paymentDate);

          switch (currentPlanType.toLowerCase()) {
            case 'mensal':
              nextDate.setMonth(nextDate.getMonth() + 1);
              break;
            case 'trimestral':
              nextDate.setMonth(nextDate.getMonth() + 3);
              break;
            case 'semestral':
              nextDate.setMonth(nextDate.getMonth() + 6);
              break;
            case 'anual':
              nextDate.setFullYear(nextDate.getFullYear() + 1);
              break;
            default:
              // Se não for um dos planos conhecidos, adiciona 1 mês por padrão
              nextDate.setMonth(nextDate.getMonth() + 1);
          }

          updateData.nextPaymentDate = nextDate.toISOString().split('T')[0];
        }
      } else {
        // Se não foi enviado amountPaid, mas foi enviado lastPaymentDate ou nextPaymentDate
        if (lastPaymentDate !== undefined) {
          const date = new Date(lastPaymentDate);
          updateData.lastPaymentDate = date.toISOString().split('T')[0];
        }
        if (nextPaymentDate !== undefined) {
          const date = new Date(nextPaymentDate);
          updateData.nextPaymentDate = date.toISOString().split('T')[0];
        }
      }

      console.log('Updating student data:', JSON.stringify(updateData, null, 2));
      if (Object.keys(updateData).length > 0) {
        await studentRepo.update({ userId: Number(id) }, updateData);
        console.log('Student updated successfully');
      }
    }

    const result = await studentRepo.findOne({ where: { userId: Number(id) }, relations: { user: true } });
    return res.json(result);
  } catch (e) {
    console.error('=== ERROR UPDATING STUDENT ===');
    console.error('Error details:', e);
    if (e instanceof Error) {
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
    }
    return res.status(500).json({ message: 'Server error', error: e instanceof Error ? e.message : String(e) });
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
