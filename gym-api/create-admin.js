import { AppDataSource } from './src/data-source.js';
import bcrypt from 'bcrypt';
import { User } from './src/entities/User.js';

async function createAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado ao banco de dados');
    
    const userRepository = AppDataSource.getRepository(User);
    
    // Verifica se o usuário admin já existe
    let admin = await userRepository.findOne({ where: { email: 'admin@academia.com' } });
    
    if (admin) {
      console.log('Usuário admin já existe');
      return;
    }
    
    // Cria um novo usuário admin
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    
    admin = userRepository.create({
      name: 'Administrador',
      email: 'admin@academia.com',
      passwordHash,
      userType: 'admin',
      status: 'active'
    });
    
    await userRepository.save(admin);
    console.log('Usuário admin criado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit();
  }
}

createAdmin();
