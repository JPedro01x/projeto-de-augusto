import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/Student';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class UploadController {
  private studentRepository = AppDataSource.getRepository(Student);

  async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
      }

      const { studentId } = req.params;
      const student = await this.studentRepository.findOne({ 
        where: { userId: parseInt(studentId) } 
      });

      if (!student) {
        // Remove o arquivo enviado se o aluno não for encontrado
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }

      // Gera um nome único para o arquivo
      const fileExt = path.extname(req.file.originalname);
      const fileName = `avatar_${crypto.randomBytes(8).toString('hex')}${fileExt}`;
      const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
      const filePath = path.join(uploadDir, fileName);

      // Cria o diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move o arquivo para o diretório de uploads
      fs.renameSync(req.file.path, filePath);

      // Remove a imagem antiga se existir
      if (student.avatar) {
        const oldFilePath = path.join(__dirname, '../../public', student.avatar);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Atualiza o caminho da imagem no banco de dados
      student.avatar = `/uploads/avatars/${fileName}`;
      await this.studentRepository.save(student);

      return res.status(200).json({ 
        message: 'Avatar atualizado com sucesso',
        avatar: student.avatar
      });
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      // Remove o arquivo em caso de erro
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: 'Erro ao processar o upload' });
    }
  }

  async getAvatar(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const student = await this.studentRepository.findOne({ 
        where: { userId: parseInt(studentId) } 
      });

      if (!student?.avatar) {
        return res.status(404).json({ message: 'Avatar não encontrado' });
      }

      const filePath = path.join(__dirname, '../../public', student.avatar);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Arquivo de avatar não encontrado' });
      }

      return res.sendFile(filePath);
    } catch (error) {
      console.error('Erro ao buscar avatar:', error);
      return res.status(500).json({ message: 'Erro ao buscar o avatar' });
    }
  }
}

export const uploadController = new UploadController();
