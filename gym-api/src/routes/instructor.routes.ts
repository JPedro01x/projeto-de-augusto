import { Router } from 'express';
import { authenticateToken } from '../middleware';
import { listInstructors, createInstructor } from '../controllers/instructor.controller';

const router = Router();

// Listar instrutores (apenas admin)
router.get('/', authenticateToken, listInstructors);

// Criar novo instrutor (apenas admin)
router.post('/', authenticateToken, createInstructor);

export default router;
