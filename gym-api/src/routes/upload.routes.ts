import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/upload.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const upload = multer({ 
  dest: 'uploads/temp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
    }
  }
});

const router = Router();

// Rota para fazer upload do avatar do aluno
router.post(
  '/students/:studentId/avatar',
  authenticateToken,
  upload.single('avatar'),
  uploadController.uploadAvatar
);

// Rota para obter o avatar do aluno
router.get(
  '/students/:studentId/avatar',
  uploadController.getAvatar
);

export default router;
