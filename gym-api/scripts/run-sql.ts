import { AppDataSource } from '../src/config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runSqlFile(filePath: string) {
  try {
    // Inicializa a conexão com o banco de dados
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida.');

    // Lê o arquivo SQL
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Divide o script em comandos individuais
    const commands = sql.split(';').filter(command => command.trim() !== '');
    
    // Executa cada comando
    for (const command of commands) {
      try {
        console.log('Executando comando:', command.trim());
        await AppDataSource.query(command);
        console.log('Comando executado com sucesso.');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error('Erro ao executar comando:', errorMessage);
        // Continua para o próximo comando mesmo se houver erro
      }
    }
    
    console.log('Script SQL executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar o script SQL:', error);
  } finally {
    // Fecha a conexão com o banco de dados
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexão com o banco de dados fechada.');
    }
  }
}

// Obtém o caminho do arquivo SQL a partir dos argumentos da linha de comando
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Por favor, forneça o caminho para o arquivo SQL.');
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), args[0]);
console.log(`Executando arquivo: ${filePath}`);

runSqlFile(filePath);
