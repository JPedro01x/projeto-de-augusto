import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';

async function testLogin() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conectado ao banco de dados');

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: 'carlos@gmail.com' } });

    if (!user) {
      console.log('✗ Usuário carlos@gmail.com não encontrado');
      return;
    }

    console.log('✓ Usuário encontrado:', { id: user.id, name: user.name, email: user.email });
    console.log('Hash armazenado:', user.passwordHash);

    // Testar se a senha funciona
    const testPassword = 'Senha123@';
    const match = await bcrypt.compare(testPassword, user.passwordHash);
    console.log(`Testando senha "${testPassword}": ${match ? '✓ MATCH' : '✗ FALHA'}`);

    // Tentar algumas variações
    const variations = ['Senha123@', 'senha123@', 'Senha123', '123456'];
    for (const pwd of variations) {
      const m = await bcrypt.compare(pwd, user.passwordHash);
      console.log(`  "${pwd}": ${m ? '✓ MATCH' : '✗'}`);
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testLogin();
