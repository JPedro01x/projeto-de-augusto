import { Router } from 'express';
import { authenticateToken } from '../middleware';
import { listInstructors } from '../controllers/instructor.controller';

const router = Router();

router.get('/', authenticateToken, listInstructors);

export default router;
