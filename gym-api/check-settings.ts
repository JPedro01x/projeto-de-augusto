import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import * as entities from './src/entities';

dotenv.config();

async function checkSettings() {
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
  });

  try {
    console.log('Initializing data source...');
    const dataSource = await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    console.log('Checking gym_settings table...');
    const settings = await dataSource.query('SELECT * FROM gym_settings');
    console.log('Gym Settings:', settings);

    await dataSource.destroy();
  } catch (error) {
    console.error('Error during database operation:', error);
    process.exit(1);
  }
}

checkSettings();
