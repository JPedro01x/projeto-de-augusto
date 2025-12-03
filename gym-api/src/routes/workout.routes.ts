import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getStudentWorkouts, getWorkoutById, getInstructorWorkouts } from '../controllers/workout.controller';

const router = Router();

// Rotas protegidas por autenticação
router.use(authenticateToken);

// Obter treinos de um aluno
router.get('/students/:studentId/workouts', getStudentWorkouts);

// Obter treinos de um instrutor (por usuário)
router.get('/instructors/:instructorId/workouts', getInstructorWorkouts);
// Obter detalhes de um treino específico
router.get('/workouts/:id', getWorkoutById);

export default router;
