import { AppDataSource } from '../../../config/database';
import { User } from '../../entities/User';
import * as bcrypt from 'bcryptjs';

export async function seedAdminUser() {
  const userRepository = AppDataSource.getRepository(User);
  
  // Verifica se já existe um admin
  const adminExists = await userRepository.findOne({ 
    where: { email: 'admin@academia.com' } 
  });

  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = userRepository.create({
      name: 'Administrador',
      email: 'admin@academia.com',
      passwordHash,
      userType: 'admin',
      status: 'active'
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
}
