import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import bcrypt from 'bcryptjs';
import { User } from '../src/entities/User';

async function resetPassword() {
  try {
    console.log('Inicializando conexão com o banco de dados...');
    await AppDataSource.initialize();
    
    const userRepository = AppDataSource.getRepository(User);
    const email = 'admin@academia.com';
    const password = 'admin123';
    
    console.log(`Redefinindo senha para ${email}...`);
    
    // Gerar novo hash para a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Atualizar o usuário
    const result = await userRepository.update(
      { email },
      { passwordHash }
    );
    
    if (result.affected === 0) {
      console.log('Usuário não encontrado. Criando novo usuário admin...');
      const newUser = userRepository.create({
        name: 'Administrador',
        email,
        passwordHash,
        userType: 'admin',
        status: 'active'
      });
      await userRepository.save(newUser);
      console.log('Novo usuário admin criado com sucesso!');
    } else {
      console.log('Senha redefinida com sucesso!');
    }
    
    // Verificar se a senha foi salva corretamente
    const updatedUser = await userRepository.findOne({ where: { email } });
    if (updatedUser) {
      const isMatch = await bcrypt.compare(password, updatedUser.passwordHash);
      console.log('Verificação de senha:', isMatch ? 'Senha válida' : 'Senha inválida');
    }
    
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Conexão com o banco de dados encerrada.');
    process.exit(0);
  }
}

resetPassword().catch(console.error);
