import { AppDataSource } from './src/data-source';
import { User } from './src/entities/User';
import * as bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  const users = [
    { name: 'Carlos Silva', email: 'carlos@gmail.com', password: 'carlos123' },
    { name: 'Maria Santos', email: 'maria@gmail.com', password: 'maria123' },
    { name: 'Roberto Lima', email: 'roberto@gmail.com', password: 'roberto123' }
  ];

  for (const u of users) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await userRepo.save(userRepo.create({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: 'instructor'
      }));
      console.log(`Created user: ${u.name}`);
    }
  }
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
