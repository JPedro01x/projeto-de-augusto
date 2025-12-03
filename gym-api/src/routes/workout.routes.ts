import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
<<<<<<< HEAD
import { getStudentWorkouts, getWorkoutById, getInstructorWorkouts } from '../controllers/workout.controller';
=======
import { getStudentWorkouts, getWorkoutById } from '../controllers/workout.controller';
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf

const router = Router();

// Rotas protegidas por autenticação
router.use(authenticateToken);

// Obter treinos de um aluno
router.get('/students/:studentId/workouts', getStudentWorkouts);

<<<<<<< HEAD
// Obter treinos de um instrutor (por usuário)
router.get('/instructors/:instructorId/workouts', getInstructorWorkouts);

=======
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
// Obter detalhes de um treino específico
router.get('/workouts/:id', getWorkoutById);

export default router;
