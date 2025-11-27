import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import * as entities from './entities';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Maiorde18.',
  database: process.env.DB_NAME || 'gym_management',
  synchronize: false,
  logging: true,
  entities: Object.values(entities).filter(entity => typeof entity === 'function'),
  migrations: ['src/migrations/*.ts'],
  migrationsRun: false,
  migrationsTableName: 'migrations',
  migrationsTransactionMode: 'each',
});

// Função para inicializar a conexão com o banco de dados
export const initializeDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log('Data Source has been initialized!');
    } catch (err) {
      console.error('Error during Data Source initialization:', err);
      throw err;
    }
  }
  return AppDataSource;
};

export default AppDataSource;
