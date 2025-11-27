import { app } from './app';
import { initializeDataSource } from './data-source';

const PORT = process.env.PORT || 3000;

// Inicializa o banco de dados e depois inicia o servidor
const startServer = async () => {
  try {
    // Inicializa a conexão com o banco de dados
    await initializeDataSource();
    console.log('Database connection established successfully!');
    
    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
