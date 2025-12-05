import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Instructor } from '../entities/Instructor';
import { Student } from '../entities/Student';
import { MoreThanOrEqual } from 'typeorm';
import bcrypt from 'bcrypt';

export const listInstructors = async (req: Request, res: Response) => {
  console.log('=== listInstructors chamado ===');
  console.log('Headers:', req.headers);
  console.log('Método:', req.method);
  console.log('URL original:', req.originalUrl);

  const queryRunner = AppDataSource.createQueryRunner();

  // Configuração CORS
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Lidar com requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('Resposta para OPTIONS enviada');
    return res.status(200).end();
  }

  try {
    console.log('Iniciando listagem de instrutores...');

    await queryRunner.connect();

    // Busca os instrutores com os dados do usuário relacionado
    const instructors = await queryRunner.manager
      .createQueryBuilder(Instructor, 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .where('user.status = :status', { status: 'active' })
      .getMany();

    console.log(`Encontrados ${instructors.length} instrutores`);

    const result = await Promise.all(instructors.map(async (instructor) => {
      try {
        // Obtém a contagem de alunos ativos
        let activeStudentsCount = 0;
        try {
          const activeStudents = await queryRunner.manager
            .createQueryBuilder()
            .select('COUNT(*)', 'count')
            .from('student_instructors_instructor', 'si')
            .where('si.instructorId = :instructorId', { instructorId: instructor.userId })
            .getRawOne();
          activeStudentsCount = activeStudents?.count || 0;
        } catch (error) {
          console.warn('Erro ao buscar alunos ativos, usando 0 como padrão:', error);
          activeStudentsCount = 0;
        }

        return {
          id: instructor.userId,
          name: instructor.user?.name || 'Nome não informado',
          email: instructor.user?.email || '',
          phone: instructor.phone || instructor.user?.phone || '',
          cpf: instructor.user?.cpf || '',
          specialty: instructor.specialty || 'Não especificado',
          certifications: instructor.certifications || '',
          hireDate: instructor.hireDate || null,
          photoUrl: instructor.photoUrl || '',
          bio: instructor.bio || '',
          salary: instructor.salary || 0,
          activeStudents: activeStudentsCount
        };
      } catch (error) {
        console.error(`Erro ao processar instrutor ${instructor.userId}:`, error);
        return null;
      }
    }));

    // Filtra quaisquer resultados nulos que possam ter ocorrido durante o processamento
    const filteredResult = result.filter((instructor): instructor is NonNullable<typeof instructor> => instructor !== null);

    console.log('Lista de instrutores processada com sucesso');
    return res.json(filteredResult);
  } catch (error) {
    console.error('Erro ao listar instrutores:', error);
    return res.status(500).json({
      message: 'Erro ao listar instrutores',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  } finally {
    // Libera o query runner após o uso
    await queryRunner.release();
  }
};

export const getInstructorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`Buscando instrutor com ID: ${id}`);

    const instructorRepo = AppDataSource.getRepository(Instructor);
    const instructor = await instructorRepo.findOne({
      where: { userId: Number(id) },
      relations: ['user']
    });

    if (!instructor || !instructor.user || instructor.user.status !== 'active') {
      console.log(`Instrutor com ID ${id} não encontrado ou inativo`);
      return res.status(404).json({ message: 'Instrutor não encontrado' });
    }

    // Get student count from junction table
    const activeStudents = await AppDataSource.query(
      'SELECT COUNT(*) as count FROM student_instructors_instructor WHERE instructorId = ?',
      [instructor.userId]
    );

    const result = {
      id: instructor.userId,
      name: instructor.user.name,
      email: instructor.user.email,
      phone: instructor.user.phone || '',
      cpf: instructor.user.cpf || '',
      specialty: instructor.specialty || '',
      certifications: instructor.certifications || '',
      hireDate: instructor.hireDate || null,
      photoUrl: instructor.photoUrl || '',
      bio: instructor.bio || '',
      salary: instructor.salary || 0,
      activeStudents: activeStudents[0]?.count || 0
    };

    console.log(`Instrutor ${id} encontrado com sucesso`);
    return res.json(result);
  } catch (error) {
    console.error('Erro ao buscar instrutor:', error);
    return res.status(500).json({
      message: 'Erro ao buscar instrutor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

export const createInstructor = async (req: Request, res: Response) => {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    const {
      name,
      email,
      password,
      phone,
      cpf,
      specialty,
      certifications,
      hireDate,
      bio,
      photoUrl,
      salary
    } = req.body;

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
      await queryRunner.rollbackTransaction();
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Cria o usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      cpf,
      userType: 'instructor' as const,
      status: 'active'
    });

    const savedUser = await queryRunner.manager.save(newUser);

    // Cria o instrutor
    const newInstructor = instructorRepo.create({
      userId: savedUser.id,
      user: savedUser,
      specialty: specialty || null,
      certifications: certifications || null,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      bio: bio || null,
      photoUrl: photoUrl || null,
      salary: salary ? Number(salary) : 0
    });

    const savedInstructor = await queryRunner.manager.save(newInstructor);
    await queryRunner.commitTransaction();

    // Retorna os dados do instrutor criado
    const result = {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone || '',
      cpf: savedUser.cpf || '',
      specialty: savedInstructor.specialty || '',
      certifications: savedInstructor.certifications || '',
      hireDate: savedInstructor.hireDate || null,
      photoUrl: savedInstructor.photoUrl || '',
      bio: savedInstructor.bio || '',
      salary: savedInstructor.salary || 0,
      activeStudents: 0
    };

    return res.status(201).json(result);
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error('Erro ao criar instrutor:', error);
    return res.status(500).json({ message: 'Erro ao criar instrutor' });
  } finally {
    await queryRunner.release();
  }
};
