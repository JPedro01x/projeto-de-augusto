import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';

async function recreateInstructors() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conectado ao banco de dados');

    const userRepo = AppDataSource.getRepository(User);
    const emails = ['carlos@gmail.com', 'maria@gmail.com', 'roberto@gmail.com'];
    const password = 'Senha123@';
    const saltRounds = 10;

    for (const email of emails) {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const result = await userRepo.update(
        { email },
        { passwordHash: hashedPassword }
      );

      if (result.affected === 1) {
        console.log(`✓ Senha de ${email} atualizada`);
      } else {
        console.log(`✗ ${email} não encontrado`);
      }
    }

    console.log('\n✓ Todas as senhas foram atualizadas com sucesso!');
    console.log('\nNovos logins disponíveis:');
    console.log('  Email: carlos@gmail.com | Senha: Senha123@');
    console.log('  Email: maria@gmail.com | Senha: Senha123@');
    console.log('  Email: roberto@gmail.com | Senha: Senha123@');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

recreateInstructors();
