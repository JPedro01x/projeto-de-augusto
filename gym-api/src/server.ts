import 'reflect-metadata';
import { app } from './app';
import { AppDataSource } from './data-source';

const PORT = process.env.PORT || 3000;
let serverStarted = false;

async function startServer() {
  try {
    console.log('Initializing database connection...');
    
    // Inicializa o banco de dados
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connected successfully!');
    }

    // Inicia o servidor
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      serverStarted = true;
      console.log('✓ Server is now accepting requests...');
      
      // Send heartbeat every 10 seconds
      setInterval(() => {
        console.log('[ALIVE] Server is still running - ' + new Date().toISOString());
      }, 10000);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('[ERROR] Server error:', error);
      process.exit(1);
    });

    // Keep server running
    // Don't exit if server doesn't start - it will retry
    
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

// Inicia o servidor
startServer().catch(error => {
  console.error('[ERROR] Unhandled error during server startup:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});
