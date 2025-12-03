import { AppDataSource } from '../data-source';
import { Student } from '../entities/Student';
import { Payment } from '../entities/Payment';
import { WorkoutPlan } from '../entities/WorkoutPlan';
import { Attendance } from '../entities/Attendance';
import { MoreThanOrEqual, ObjectLiteral, Repository, EntityTarget } from 'typeorm';
import { subMonths, startOfDay } from 'date-fns';

export class DashboardService {
  private async ensureConnection() {
    if (!AppDataSource.isInitialized) {
      console.log('Inicializando conexão com o banco de dados...');
      try {
        await AppDataSource.initialize();
        console.log('Conexão com o banco de dados inicializada com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar conexão com o banco de dados:', error);
        throw new Error('Falha ao conectar ao banco de dados');
      }
    }
  }

  private getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    if (!AppDataSource.isInitialized) {
      throw new Error('Conexão com o banco de dados não inicializada');
    }
    return AppDataSource.getRepository<T>(entity);
  }

  async getDashboardStats() {
    console.log('=== INICIANDO getDashboardStats ===');
    
    try {
      console.log('1. Garantindo conexão com o banco de dados...');
      try {
        await this.ensureConnection();
        console.log('✅ Conexão com o banco de dados estabelecida');
      } catch (dbError) {
        console.error('❌ Falha na conexão com o banco de dados:', dbError);
        throw new Error('Falha ao conectar ao banco de dados: ' + (dbError instanceof Error ? dbError.message : String(dbError)));
      }
      
      console.log('2. Obtendo repositórios...');
      let studentRepository, paymentRepository, workoutRepository, attendanceRepository;
      
      try {
        studentRepository = this.getRepository<Student>(Student);
        paymentRepository = this.getRepository<Payment>(Payment);
        workoutRepository = this.getRepository<WorkoutPlan>(WorkoutPlan);
        attendanceRepository = this.getRepository<Attendance>(Attendance);
        console.log('✅ Repositórios obtidos com sucesso');
      } catch (repoError) {
        console.error('❌ Erro ao obter repositórios:', repoError);
        throw new Error('Falha ao inicializar repositórios: ' + (repoError instanceof Error ? repoError.message : String(repoError)));
      }

      console.log('3. Buscando alunos ativos...');
      const activeStudents = await studentRepository
        .createQueryBuilder('student')
        .innerJoin('student.user', 'user')
        // O banco usa a coluna `status` com valores 'active'/'inactive'
        .where('user.status = :status', { status: 'active' })
        .getCount();
      console.log('Alunos ativos encontrados:', activeStudents);
      
      console.log('4. Preparando data de início do mês...');
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      console.log('Data de início do mês:', startOfMonth);
      
      console.log('5. Buscando pagamentos do mês...');
      const payments = await paymentRepository.find({
        where: {
          paymentDate: MoreThanOrEqual(startOfMonth),
          status: 'paid'
        },
        select: ['amount']
      });
      
      const monthlyRevenue = payments.reduce((sum: number, payment: Payment) => sum + (payment.amount || 0), 0);
      console.log('Receita mensal calculada:', monthlyRevenue);
      
      console.log('6. Buscando presenças de hoje...');
      const todayStart = startOfDay(new Date());
      console.log('Data de hoje para busca:', todayStart);
      const todayAttendance = await attendanceRepository.count({
        where: {
          checkIn: MoreThanOrEqual(todayStart)
        }
      });
      console.log('Total de presenças hoje:', todayAttendance);
      
      console.log('7. Buscando treinos ativos...');
      const activeWorkouts = await workoutRepository.count({
        where: {
          status: 'active'
        }
      });
      console.log('Total de treinos ativos:', activeWorkouts);
      
      console.log('8. Calculando receita do mês passado...');
      const lastMonthStart = subMonths(new Date(), 1);
      console.log('Data de início do mês passado:', lastMonthStart);
      const lastMonthPayments = await paymentRepository.find({
        where: {
          paymentDate: MoreThanOrEqual(lastMonthStart),
          status: 'paid'
        },
        select: ['amount']
      });
      
      const lastMonthRevenue = lastMonthPayments.reduce((sum: number, payment: Payment) => sum + (payment.amount || 0), 0);
      const revenueChange = lastMonthRevenue > 0 ? 
        Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

      console.log('9. Montando resposta do dashboard...');
      const result = {
        summary: {
          activeStudents: {
            count: activeStudents,
            change: 5,
            trend: 'up' as const
          },
          monthlyRevenue: {
            amount: monthlyRevenue,
            change: revenueChange,
            trend: revenueChange >= 0 ? 'up' as const : 'down' as const
          },
          todayAttendance: {
            count: todayAttendance,
            change: 10,
            trend: 'up' as const
          },
          activeWorkouts: {
            count: activeWorkouts,
            change: 2,
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

      console.log('DashboardStats retornado com sucesso');
      return result;
    } catch (error) {
      console.error('❌ ERRO CRÍTICO em getDashboardStats');
      console.error('Tipo do erro:', typeof error);
      if (error instanceof Error) {
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        if ('code' in error) {
          console.error('Código do erro:', (error as any).code);
          console.error('SQL:', (error as any).sql);
          console.error('Parâmetros:', (error as any).parameters);
        }
      } else {
        console.error('Erro desconhecido:', error);
      }
      // Criar um novo erro para garantir que temos uma mensagem útil
      const enhancedError = new Error('Falha ao obter estatísticas do dashboard: ' + 
        (error instanceof Error ? error.message : 'Erro desconhecido'));
      if (error instanceof Error && 'stack' in error) {
        (enhancedError as any).originalStack = error.stack;
      }
      throw enhancedError;
    }
  }
}

export const dashboardService = new DashboardService();