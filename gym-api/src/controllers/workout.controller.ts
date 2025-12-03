import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { WorkoutPlan } from '../entities/WorkoutPlan';
import { Student } from '../entities/Student';
import { User } from '../entities/User';
import { In } from 'typeorm';

export const getStudentWorkouts = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    // Aqui o frontend está enviando o ID do usuário (user.id) na URL.
    // Precisamos encontrar o Student correspondente a esse usuário
    // e então utilizar o student.id para buscar os treinos.

    console.log('Buscando treinos para userId (param studentId):', studentId);

    const userRepository = AppDataSource.getRepository(User);
    const studentRepository = AppDataSource.getRepository(Student);

    const userId = parseInt(studentId, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    // Encontrar o Student vinculado a este usuário
    const student = await studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!student) {
      console.log('Nenhum aluno encontrado para userId:', userId);
      return res.json([]);
    }

    console.log('Buscando treinos para student.id:', student.id);

    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    const workouts = await workoutPlanRepository.find({
      where: { studentId: student.id },
      relations: ['instructor', 'instructor.user', 'student', 'student.user'],
      order: { startDate: 'DESC' },
    });

    console.log('Treinos encontrados:', workouts.length);

    // Formata a resposta
    const formattedWorkouts = workouts.map(workout => ({
      id: workout.id,
      studentId: workout.studentId,
      instructorId: workout.instructorId,
      name: workout.title,
      title: workout.title,
      description: workout.description || '',
      status: workout.status,
      startDate: workout.startDate,
      endDate: workout.endDate,
      exercises: workout.exercises || [],
      instructor: workout.instructor ? {
        id: workout.instructor.user.id,
        name: workout.instructor.user.name
      } : null,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt
    }));

    return res.json(formattedWorkouts);
  } catch (error) {
    console.error('Erro ao buscar treinos do aluno:', error);
    return res.status(500).json({ message: 'Erro ao buscar treinos' });
  }
};

// Listar treinos por instrutor (usado na área do instrutor)
export const getInstructorWorkouts = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;

    console.log('Buscando treinos para userId (param instructorId):', instructorId);

    const instructorUserId = parseInt(instructorId, 10);
    if (isNaN(instructorUserId)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    // Encontrar o instrutor vinculado a este usuário
    const instructorRepo = AppDataSource.getRepository('Instructor');
    const instructor = await instructorRepo.findOne({
      where: { user: { id: instructorUserId } },
      relations: ['user'],
    } as any);

    if (!instructor) {
      console.log('Nenhum instrutor encontrado para userId:', instructorUserId);
      return res.json([]);
    }

    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    const workouts = await workoutPlanRepository.find({
      where: { instructorId: instructor.id },
      relations: ['student', 'student.user', 'instructor', 'instructor.user'],
      order: { startDate: 'DESC' },
    });

    const formatted = workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      description: workout.description || '',
      status: workout.status,
      startDate: workout.startDate,
      endDate: workout.endDate,
      exercises: workout.exercises || [],
      student: workout.student
        ? {
            id: workout.student.user.id,
            name: workout.student.user.name,
            email: workout.student.user.email,
          }
        : null,
      instructor: workout.instructor
        ? {
            id: workout.instructor.user.id,
            name: workout.instructor.user.name,
          }
        : null,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar treinos do instrutor:', error);
    return res.status(500).json({ message: 'Erro ao buscar treinos do instrutor' });
  }
};

export const getWorkoutById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    const workout = await workoutPlanRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['instructor', 'instructor.user', 'student', 'student.user']
    });

    if (!workout) {
      return res.status(404).json({ message: 'Treino não encontrado' });
    }

    // Verifica se o usuário tem permissão para acessar este treino
    const userId = (req.user as any)?.id;
    if (workout.student.user.id !== userId && workout.instructor.user.id !== userId) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    // Formata a resposta
    const formattedWorkout = {
      id: workout.id,
      title: workout.title,
      description: workout.description,
      status: workout.status,
      startDate: workout.startDate,
      endDate: workout.endDate,
      exercises: workout.exercises,
      instructor: {
        id: workout.instructor.user.id,
        name: workout.instructor.user.name,
        email: workout.instructor.user.email
      },
      student: {
        id: workout.student.user.id,
        name: workout.student.user.name
      },
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt
    };

    return res.json(formattedWorkout);
  } catch (error) {
    console.error('Erro ao buscar treino:', error);
    return res.status(500).json({ message: 'Erro ao buscar treino' });
  }
};
