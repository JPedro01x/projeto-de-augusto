import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { WorkoutPlan } from '../entities/WorkoutPlan';
import { Student } from '../entities/Student';
import { User } from '../entities/User';
import { In } from 'typeorm';

export const getStudentWorkouts = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    console.log('Buscando treinos para studentId:', studentId);
    
    // Busca os treinos do aluno diretamente pela student_id na tabela workout_plans
    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    const workouts = await workoutPlanRepository.find({
      where: { studentId: parseInt(studentId) },
      relations: ['instructor', 'instructor.user', 'student', 'student.user'],
      order: { startDate: 'DESC' }
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
