import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../src/config/database';
import { User } from '../src/entities/User';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('DB connected');

    const repo = AppDataSource.getRepository(User);

    const students = await repo
      .createQueryBuilder('u')
      .where("u.user_type = :t", { t: 'student' })
      .andWhere("(u.password_hash IS NULL OR u.password_hash = '')")
      .getMany();

    if (students.length === 0) {
      console.log('Nenhum aluno sem senha encontrado. Nada a fazer.');
      return;
    }

    console.log(`Encontrados ${students.length} alunos sem senha. Atualizando...`);

    const defaultPassword = '123456';
    const salt = await bcrypt.genSalt(10);

    for (const studentUser of students) {
      studentUser.passwordHash = await bcrypt.hash(defaultPassword, salt);
      await repo.save(studentUser);
      console.log(`Senha definida para aluno ID ${studentUser.id} (${studentUser.email})`);
    }

    console.log('Concluído. Senhas padrão atribuídas aos alunos sem senha.');
  } catch (e) {
    console.error('Erro no backfill de senhas:', e);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
}

run();
