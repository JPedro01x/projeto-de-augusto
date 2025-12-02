import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import {
  User,
  Student,
  Instructor,
  Attendance,
  Payment,
  Plan,
  StudentPlan,
  Notification,
  Treino,
  WorkoutPlan,
  GymSettings
} from './entities';

// Carrega as variáveis de ambiente
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'gym_management',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Student,
    Instructor,
    Attendance,
    Payment,
    Plan,
    StudentPlan,
    Notification,
    Treino,
    WorkoutPlan,
    GymSettings
  ],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
