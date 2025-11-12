import { Router } from 'express';
import { createStudent, listStudents, updateStudent, deleteStudent } from '../controllers/student.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', auth, listStudents);
router.post('/', auth, createStudent);
router.put('/:id', auth, updateStudent);
router.delete('/:id', auth, deleteStudent);

export default router;
