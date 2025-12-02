import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  console.log('=== INICIANDO getDashboardStats ===');
  try {
    console.log('1. Iniciando busca de estatísticas do dashboard...');
    const stats = await dashboardService.getDashboardStats();
    console.log('2. Estatísticas do dashboard obtidas com sucesso');
    return res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('=== ERRO NO DASHBOARD CONTROLLER ===');
    console.error('Tipo do erro:', typeof error);
    console.error('Mensagem:', error instanceof Error ? error.message : 'Erro desconhecido');
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    
    // Se for um erro de validação do TypeORM, retornar detalhes adicionais
    if (error instanceof Error && 'code' in error) {
      console.error('Código do erro:', (error as any).code);
      console.error('Query:', (error as any).query);
      console.error('Parameters:', (error as any).parameters);
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estatísticas do dashboard',
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          ...(error as any).code && { code: (error as any).code },
          ...(error as any).query && { query: (error as any).query },
          ...(error as any).parameters && { parameters: (error as any).parameters }
        } : {})
      } : 'Erro desconhecido'
    });
  }
};
