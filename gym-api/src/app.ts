import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { router } from './routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

export const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', router);
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => console.log('Database connected'))
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
