import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import * as entities from './entities';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: Object.values(entities).filter(entity => typeof entity === 'function'),
  migrations: ['src/migrations/*.ts'],
});

export default AppDataSource;
