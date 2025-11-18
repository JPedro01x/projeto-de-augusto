import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { GymSettings } from '../entities/GymSettings';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

// Obter repositórios de forma segura
const getRepositories = () => {
  if (!AppDataSource.isInitialized) {
    console.log('DataSource não inicializado, inicializando...');
    return AppDataSource.initialize().then(() => ({
      settingsRepository: AppDataSource.getRepository(GymSettings),
      userRepository: AppDataSource.getRepository(User)
    }));
  }
  
  return Promise.resolve({
    settingsRepository: AppDataSource.getRepository(GymSettings),
    userRepository: AppDataSource.getRepository(User)
  });
};

// Inicializar os repositórios
let settingsRepository: any;
let userRepository: any;

// Inicialização dos repositórios
const initRepositories = getRepositories().then(repositories => {
  settingsRepository = repositories.settingsRepository;
  userRepository = repositories.userRepository;
  console.log('Repositórios inicializados com sucesso');
  return repositories;
}).catch(error => {
  console.error('Erro ao inicializar repositórios:', error);
  throw error;
});

export class SettingsController {
  // Obter configurações da academia
  static async getGymSettings(req: Request, res: Response) {
    try {
      console.log('Buscando configurações da academia...');
      
      // Garantir que os repositórios estão inicializados
      if (!settingsRepository) {
        console.log('Aguardando inicialização dos repositórios...');
        await initRepositories;
      }
      
      console.log('Repository:', settingsRepository);
      const settings = await settingsRepository.findOne({ where: {} });
      console.log('Configurações encontradas:', settings);
      
      if (!settings) {
        console.log('Nenhuma configuração encontrada, retornando objeto vazio');
        // Se não existir configuração, retorna um objeto vazio
        return res.status(200).json({
          name: '',
          email: '',
          phone: '',
          address: '',
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true
        });
      }

      return res.json(settings);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Atualizar configurações da academia
  static async updateGymSettings(req: Request, res: Response) {
    try {
      // Garantir que os repositórios estão inicializados
      if (!settingsRepository) {
        await initRepositories;
      }
      const { name, email, phone, address, emailNotifications, smsNotifications, pushNotifications } = req.body;
      
      let settings = await settingsRepository.findOne({ where: {} });
      
      if (!settings) {
        // Se não existir configuração, cria uma nova
        settings = new GymSettings();
      }
      
      // Atualiza os campos
      settings.name = name;
      settings.email = email;
      settings.phone = phone;
      settings.address = address;
      settings.emailNotifications = emailNotifications;
      settings.smsNotifications = smsNotifications;
      settings.pushNotifications = pushNotifications;
      
      await settingsRepository.save(settings);
      
      return res.json({ message: 'Configurações atualizadas com sucesso', settings });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({ message: 'Erro ao atualizar configurações' });
    }
  }

  // Alterar senha do administrador
  static async changePassword(req: Request, res: Response) {
    try {
      // Garantir que os repositórios estão inicializados
      if (!settingsRepository || !userRepository) {
        await initRepositories;
      }
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      const user = await userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verifica a senha atual
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }
      
      // Atualiza a senha
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      user.passwordHash = newPasswordHash;
      await userRepository.save(user);
      
      return res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ message: 'Erro ao alterar senha' });
    }
  }
}
