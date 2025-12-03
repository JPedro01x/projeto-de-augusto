import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { GymSettings } from '../entities/GymSettings';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

// Obter repositórios de forma segura
const getRepositories = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      console.log('Inicializando conexão com o banco de dados...');
      await AppDataSource.initialize();
      console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }
    
    return {
      settingsRepository: AppDataSource.getRepository(GymSettings),
      userRepository: AppDataSource.getRepository(User)
    };
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    throw new Error('Falha ao conectar ao banco de dados');
  }
};

export class SettingsController {
  // Obter configurações da academia
  static async getGymSettings(req: Request, res: Response) {
    try {
      console.log('Buscando configurações da academia...');
      
      // Obter repositórios
      const { settingsRepository } = await getRepositories();
      
      const settings = await settingsRepository.findOne({ where: {} });
      
      if (!settings) {
        return res.status(404).json({ message: 'Configurações não encontradas' });
      }
      
      return res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ 
        message: 'Erro ao buscar configurações da academia',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Atualizar configurações da academia
  static async updateGymSettings(req: Request, res: Response) {
    try {
      console.log('Atualizando configurações da academia...');
      
      const { settingsRepository } = await getRepositories();
      const settings = await settingsRepository.findOne({ where: {} });
      
      if (!settings) {
        return res.status(404).json({ message: 'Configurações não encontradas' });
      }
      
      // Atualiza apenas os campos fornecidos
      Object.assign(settings, req.body);
      
      await settingsRepository.save(settings);
      
      return res.json({ message: 'Configurações atualizadas com sucesso', settings });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({ 
        message: 'Erro ao atualizar configurações',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Outros métodos do controller...
}