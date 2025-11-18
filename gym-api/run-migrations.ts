import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import * as entities from './src/entities';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gym_management',
  synchronize: false,
  logging: true,
  entities: Object.values(entities).filter(entity => typeof entity === 'function'),
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});

async function runMigrations() {
  try {
    console.log('Initializing data source...');
    const dataSource = await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations have been executed successfully!');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error during migrations:', error);
    process.exit(1);
  }
}

runMigrations();
