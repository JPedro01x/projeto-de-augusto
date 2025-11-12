import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import instructorRoutes from './instructor.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/instructors', instructorRoutes);

export { router };
