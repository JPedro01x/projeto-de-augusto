import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

async function listUsers() {
  try {
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    
    if (users.length === 0) {
      console.log('Nenhum usuário encontrado no banco de dados.');
    } else {
      console.log('Usuários encontrados:');
      console.table(users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      })));
    }
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  } finally {
    process.exit(0);
  }
}

listUsers();
