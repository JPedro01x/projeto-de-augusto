import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true
};

// Aplicar o CORS antes de outras rotas
app.use(cors(corsOptions));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Body parsing middleware
app.use(express.json());

// Health check endpoint (sem autenticação)
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz para verificar se a API está online
app.get('/', (_req, res) => {
  res.json({
    message: 'API do Gym Management está online!',
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API (com autenticação)
app.use('/api', router);

// Middleware de tratamento de erros
app.use(errorHandler);

export { app };
