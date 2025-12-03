import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User } from './entities/User';
import bcrypt from 'bcrypt';

async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    // Criar usuário admin padrão se não existir
    const userRepository = AppDataSource.getRepository(User);
    const adminExists = await userRepository.findOne({ where: { email: 'admin@example.com' } });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      await userRepository.save(admin);
      console.log('Admin user created');
    }

    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

export { initializeDatabase };
