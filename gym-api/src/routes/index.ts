import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import instructorRoutes from './instructor.routes';
import { dashboardRouter } from './dashboard.routes';
import financeRoutes from './finance.routes';
import workoutRoutes from './workout.routes';
import notificationRoutes from './notification.routes';
import { settingsRoutes } from './settings.routes';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas
router.use('/students', authenticateJWT, studentRoutes);
router.use('/instructors', authenticateJWT, instructorRoutes);
router.use('/dashboard', authenticateJWT, dashboardRouter);
router.use('/finance', authenticateJWT, financeRoutes);
router.use('/notifications', authenticateJWT, notificationRoutes);
router.use('/settings', authenticateJWT, settingsRoutes);
router.use('', authenticateJWT, workoutRoutes);

export { router };
