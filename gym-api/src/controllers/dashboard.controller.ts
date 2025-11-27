import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  console.log('=== INICIANDO getDashboardStats ===');
  try {
    const stats = await dashboardService.getDashboardStats();
    console.log('Estatísticas do dashboard obtidas com sucesso');
    return res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao buscar estatísticas do dashboard',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
