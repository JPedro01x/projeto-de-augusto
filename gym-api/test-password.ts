import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';

async function testPassword() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conectado ao banco de dados');

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: 'carlos@gmail.com' } });
    
    if (!user) {
      console.log('✗ Usuário não encontrado');
      return;
    }

    console.log('\n📋 Informações do Usuário:');
    console.log('  Email:', user.email);
    console.log('  User Type:', user.userType);
    console.log('  Hash armazenado:', user.passwordHash);

    // Testando diferentes senhas
    const senhasParaTestar = [
      'Senha123@',
      'senha123@',
      'password123',
      'aluno123'
    ];

    console.log('\n🔐 Testando senhas:');
    for (const senha of senhasParaTestar) {
      try {
        const match = await bcrypt.compare(senha, user.passwordHash);
        console.log(`  ${match ? '✓' : '✗'} Senha "${senha}" - ${match ? 'VÁLIDA' : 'INVÁLIDA'}`);
      } catch (error) {
        console.log(`  ✗ Erro ao testar "${senha}":`, error);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

testPassword();
