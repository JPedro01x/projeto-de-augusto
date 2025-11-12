import { Router } from 'express';
import { createStudent, listStudents, updateStudent, deleteStudent } from '../controllers/student.controller';
import { authenticateToken } from '../middleware';

const router = Router();

router.get('/', authenticateToken, listStudents);
router.post('/', authenticateToken, createStudent);
router.put('/:id', authenticateToken, updateStudent);
router.delete('/:id', authenticateToken, deleteStudent);

export default router;
