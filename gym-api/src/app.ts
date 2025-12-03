import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

<<<<<<< HEAD
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
=======
// Enable CORS for all routes and log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
  next();
});

// Body parsing middleware
<<<<<<< HEAD
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
=======

app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', (_req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.json({ status: 'ok' });
});

// API routes (with auth)
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
app.use('/api', router);

// Middleware de tratamento de erros
app.use(errorHandler);

export { app };
