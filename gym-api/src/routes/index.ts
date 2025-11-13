import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import instructorRoutes from './instructor.routes';
import dashboardRoutes from './dashboard.routes';
import financeRoutes from './finance.routes';
import workoutRoutes from './workout.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/instructors', instructorRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/finance', financeRoutes);
router.use('', workoutRoutes); // Rotas de treinos na raiz da API (/api/...)

export { router };
