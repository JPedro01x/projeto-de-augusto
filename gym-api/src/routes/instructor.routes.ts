import { Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { listInstructors } from '../controllers/instructor.controller';

const router = Router();

router.get('/', auth, listInstructors);

export default router;
