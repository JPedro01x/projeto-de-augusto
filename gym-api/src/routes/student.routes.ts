import { Router } from 'express';
import { createStudent, listStudents, updateStudent, deleteStudent, debugStudentsWithInstructors } from '../controllers/student.controller';
import { authenticateToken } from '../middleware';

const router = Router();

router.get('/debug/instructors', authenticateToken, debugStudentsWithInstructors);
router.get('/', authenticateToken, listStudents);
router.post('/', authenticateToken, createStudent);
router.put('/:id', authenticateToken, updateStudent);
router.delete('/:id', authenticateToken, deleteStudent);

export default router;
