import { Router } from 'express';
import { authenticateToken } from '../middleware';
import { listInstructors, createInstructor, getInstructorById } from '../controllers/instructor.controller';

const router = Router();

// Obter instrutor por id (apenas usuários autenticados)
router.get('/:id', authenticateToken, getInstructorById);

// Listar instrutores (apenas admin)
router.get('/', authenticateToken, listInstructors);

// Criar novo instrutor (apenas admin)
router.post('/', authenticateToken, createInstructor);

export default router;
