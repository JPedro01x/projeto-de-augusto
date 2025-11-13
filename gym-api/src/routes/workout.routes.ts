import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getStudentWorkouts, getWorkoutById } from '../controllers/workout.controller';

const router = Router();

// Rotas protegidas por autenticação
router.use(authenticateToken);

// Obter treinos de um aluno
router.get('/students/:studentId/workouts', getStudentWorkouts);

// Obter detalhes de um treino específico
router.get('/workouts/:id', getWorkoutById);

export default router;
