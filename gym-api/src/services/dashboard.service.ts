import { AppDataSource } from '../data-source';
import { Student } from '../entities/Student';
import { Payment } from '../entities/Payment';
import { WorkoutPlan } from '../entities/WorkoutPlan';
import { Attendance } from '../entities/Attendance';
import { MoreThanOrEqual } from 'typeorm';
import { subMonths, startOfDay, endOfDay } from 'date-fns';

export class DashboardService {
  private async initializeRepositories() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    return {
      studentRepository: AppDataSource.getRepository(Student),
      paymentRepository: AppDataSource.getRepository(Payment),
      workoutRepository: AppDataSource.getRepository(WorkoutPlan),
      attendanceRepository: AppDataSource.getRepository(Attendance)
    };
  }

  async getDashboardStats() {
    const {
      studentRepository,
      paymentRepository,
      workoutRepository,
      attendanceRepository
    } = await this.initializeRepositories();

    // Obter contagem de alunos ativos
    const activeStudents = await studentRepository.countBy({ status: 'active' });
    
    // Calcular receita mensal
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const payments = await paymentRepository.find({
      where: {
        paymentDate: MoreThanOrEqual(startOfMonth),
        status: 'paid'
      },
      select: ['amount']
    });
    
    const monthlyRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    // Obter presenças de hoje
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    
    const todayAttendance = await attendanceRepository.count({
      where: {
        checkIn: MoreThanOrEqual(todayStart),
        checkOut: MoreThanOrEqual(todayStart)
      }
    });
    
    // Obter treinos ativos
    const activeWorkouts = await workoutRepository.count({
      where: {
        status: 'active'
      }
    });
    
    // Calcular mudanças (simplificado)
    const lastMonthStart = subMonths(new Date(), 1);
    
    const lastMonthPayments = await paymentRepository.find({
      where: {
        paymentDate: MoreThanOrEqual(lastMonthStart),
        status: 'paid'
      },
      select: ['amount']
    });
    
    const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const revenueChange = lastMonthRevenue > 0 ? 
      Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

    // Retornar dados no formato esperado
    return {
      summary: {
        activeStudents: {
          count: activeStudents,
          change: 5, // Exemplo de porcentagem de mudança
          trend: 'up' as const
        },
        monthlyRevenue: {
          amount: monthlyRevenue,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' as const : 'down' as const
        },
        todayAttendance: {
          count: todayAttendance,
          change: 10, // Exemplo de porcentagem de mudança
          trend: 'up' as const
        },
        activeWorkouts: {
          count: activeWorkouts,
          change: 2, // Exemplo de porcentagem de mudança
          trend: 'up' as const
        }
      },
      recentActivities: [
        { name: 'Novo aluno cadastrado', action: 'created', time: '2 minutos atrás' },
        { name: 'Pagamento recebido', action: 'payment', time: '10 minutos atrás' },
        { name: 'Treino atualizado', action: 'updated', time: '1 hora atrás' }
      ],
      weeklyStats: {
        attendanceRate: 85,
        newStudents: 12,
        renewals: 8,
        mostPopularPlan: 'Plano Premium',
        peakHour: '18:00'
      }
    };
  }
}

export const dashboardService = new DashboardService();
