import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './src/config/database';
import { User } from './src/entities/User';

async function resetInstructorPasswords() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Conectado ao banco de dados');

    const userRepo = AppDataSource.getRepository(User);
    
    // Dados dos treinadores com novas senhas simples
    const instructors = [
      { email: 'carlos@gmail.com', newPassword: 'carlos123' },
      { email: 'maria@gmail.com', newPassword: 'maria123' },
      { email: 'roberto@gmail.com', newPassword: 'roberto123' }
    ];

    console.log('\n🔄 Atualizando senhas dos treinadores...\n');

    for (const instructor of instructors) {
      const hashedPassword = await bcrypt.hash(instructor.newPassword, 10);
      
      const result = await userRepo.update(
        { email: instructor.email },
        { passwordHash: hashedPassword }
      );

      if (result.affected === 1) {
        console.log(`✓ ${instructor.email}`);
        console.log(`  Senha: ${instructor.newPassword}\n`);
      } else {
        console.log(`✗ ${instructor.email} - Não encontrado\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✓ Senhas atualizadas com sucesso!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📱 Novos dados de login para TREINADORES:\n');
    console.log('🎯 Treinador 1 - Carlos');
    console.log('   Email: carlos@gmail.com');
    console.log('   Senha: carlos123\n');
    console.log('🎯 Treinador 2 - Maria');
    console.log('   Email: maria@gmail.com');
    console.log('   Senha: maria123\n');
    console.log('🎯 Treinador 3 - Roberto');
    console.log('   Email: roberto@gmail.com');
    console.log('   Senha: roberto123\n');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

resetInstructorPasswords();
