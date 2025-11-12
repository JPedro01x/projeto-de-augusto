import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User, UserRole, Attendance, Payment } from '../entities';
import { Between } from 'typeorm';

export const getDashboardStats = async (req: Request, res: Response) => {
  console.log('=== INICIANDO getDashboardStats ===');
  try {
    // Verificar se a conexão com o banco de dados está ativa
    if (!AppDataSource.isInitialized) {
      console.log('Inicializando conexão com o banco de dados...');
      await AppDataSource.initialize();
      console.log('Conexão com o banco de dados inicializada com sucesso');
    }

    console.log('Obtendo repositórios...');
    const userRepository = AppDataSource.getRepository(User);
    const attendanceRepository = AppDataSource.getRepository(Attendance);
    const paymentRepository = AppDataSource.getRepository(Payment);
    console.log('Repositórios obtidos com sucesso');

    // Data atual e do mês passado para comparação
    const now = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    console.log('1. Buscando alunos ativos...');
    // 1. Alunos Ativos
    let activeStudents = 0;
    try {
      activeStudents = await userRepository.count({
        where: { 
          userType: 'student' as UserRole,
          status: 'active' 
        }
      });
      console.log(`   - Alunos ativos encontrados: ${activeStudents}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar alunos ativos:', error);
      throw new Error(`Erro ao buscar alunos ativos: ${errorMessage}`);
    }

    // Usando query direta para contar alunos ativos do mês passado
    let activeStudentsLastMonth = 0;
    try {
      console.log('1.1. Buscando alunos ativos do mês passado...');
      activeStudentsLastMonth = await userRepository
        .createQueryBuilder('user')
        .where('user.user_type = :userType', { userType: 'student' })
        .andWhere('user.status = :status', { status: 'active' })
        .andWhere('user.created_at BETWEEN :startDate AND :endDate', {
          startDate: startOfLastMonth.toISOString(),
          endDate: endOfLastMonth.toISOString()
        })
        .getCount();
      console.log(`   - Alunos ativos no mês passado: ${activeStudentsLastMonth}`);
    } catch (error) {
      console.error('Erro ao buscar alunos ativos do mês passado:', error);
      // Continuar com 0 em caso de erro
      activeStudentsLastMonth = 0;
    }

    const studentGrowth = activeStudentsLastMonth > 0 
      ? Math.round(((activeStudents - activeStudentsLastMonth) / activeStudentsLastMonth) * 100) 
      : 0;

    console.log('2. Calculando receita mensal...');
    // 2. Receita Mensal
    let currentMonthRevenue = { total: 0 };
    try {
      const result = await paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.paymentDate >= :startDate', { startDate: startOfCurrentMonth.toISOString() })
        .andWhere('payment.paymentDate <= :endDate', { endDate: now.toISOString() })
        .getRawOne();
      
      currentMonthRevenue = { total: result?.total || 0 };
      console.log(`   - Receita do mês atual: ${currentMonthRevenue.total}`);
    } catch (error: unknown) {
      console.error('Erro ao calcular receita mensal:', error);
      // Continuar com valor padrão em caso de erro
      currentMonthRevenue = { total: 0 };
    }

    let lastMonthRevenue = { total: 0 };
    try {
      const result = await paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.paymentDate >= :startDate', { startDate: startOfLastMonth.toISOString() })
        .andWhere('payment.paymentDate < :endDate', { endDate: startOfCurrentMonth.toISOString() })
        .getRawOne();
      
      lastMonthRevenue = { total: result?.total || 0 };
      console.log(`   - Receita do mês passado: ${lastMonthRevenue.total}`);
    } catch (error: unknown) {
      console.error('Erro ao calcular receita do mês passado:', error);
      // Continuar com valor padrão em caso de erro
      lastMonthRevenue = { total: 0 };
    }

    const revenueChange = lastMonthRevenue?.total > 0 
      ? Math.round((((currentMonthRevenue?.total || 0) - lastMonthRevenue.total) / lastMonthRevenue.total) * 100)
      : 0;

    // 3. Presença Hoje
    console.log('3. Calculando presença de hoje...');
    let todayAttendance = 0;
    try {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date(todayStart);
      todayEnd.setHours(23, 59, 59, 999);
      
      todayAttendance = await attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.checkIn BETWEEN :startDate AND :endDate', {
          startDate: todayStart.toISOString(),
          endDate: todayEnd.toISOString()
        })
        .getCount();
      console.log(`   - Presenças hoje: ${todayAttendance}`);
    } catch (error) {
      console.error('Erro ao calcular presença de hoje:', error);
      todayAttendance = 0;
    }

    // 3.1 Presença de ontem para comparação
    let yesterdayAttendance = 0;
    try {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStart = new Date(yesterday);
      yesterdayStart.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      yesterdayAttendance = await attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.checkIn BETWEEN :startDate AND :endDate', {
          startDate: yesterdayStart.toISOString(),
          endDate: yesterdayEnd.toISOString()
        })
        .getCount();
      console.log(`   - Presenças ontem: ${yesterdayAttendance}`);
    } catch (error) {
      console.error('Erro ao calcular presença de ontem:', error);
      yesterdayAttendance = 0;
    }

    const attendanceChange = yesterdayAttendance > 0 
      ? Math.round(((todayAttendance - yesterdayAttendance) / yesterdayAttendance) * 100)
      : todayAttendance > 0 ? 100 : 0;
    
    console.log(`   - Variação de presença: ${attendanceChange}%`);

    // 4. Treinos Ativos
    console.log('4. Buscando treinos ativos...');
    let activeWorkouts = 0;
    let lastMonthWorkouts = 0;
    
    try {
      // Treinos ativos atualmente
      const activeWorkoutsResult = await AppDataSource.manager.query(
        'SELECT COUNT(*) as count FROM workout_plans WHERE end_date >= ?',
        [now.toISOString().split('T')[0]]
      );
      activeWorkouts = activeWorkoutsResult && activeWorkoutsResult[0] ? 
        parseInt(activeWorkoutsResult[0].count, 10) : 0;
      
      console.log(`   - Treinos ativos: ${activeWorkouts}`);
      
      // Treinos do mês passado para comparação
      const lastMonthWorkoutsResult = await AppDataSource.manager.query(
        'SELECT COUNT(*) as count FROM workout_plans WHERE end_date >= ? AND end_date < ?',
        [
          startOfLastMonth.toISOString().split('T')[0],
          startOfCurrentMonth.toISOString().split('T')[0]
        ]
      );
      
      lastMonthWorkouts = lastMonthWorkoutsResult && lastMonthWorkoutsResult[0] ? 
        parseInt(lastMonthWorkoutsResult[0].count, 10) : 0;
      
      console.log(`   - Treinos ativos no mês passado: ${lastMonthWorkouts}`);
    } catch (error) {
      console.error('Erro ao buscar treinos ativos:', error);
      // Continuar com 0 em caso de erro
      activeWorkouts = 0;
      lastMonthWorkouts = 0;
    }

    const workoutsChange = lastMonthWorkouts > 0
      ? Math.round(((activeWorkouts - lastMonthWorkouts) / lastMonthWorkouts) * 100)
      : activeWorkouts > 0 ? 100 : 0;
    
    console.log(`   - Variação de treinos: ${workoutsChange}%`);

    // 5. Atividades Recentes
    console.log('5. Buscando atividades recentes...');
    let recentActivities = [];
    try {
      recentActivities = await attendanceRepository
        .createQueryBuilder('attendance')
        .leftJoin('attendance.student', 'student')
        .leftJoin('student.user', 'user')
        .select([
          'user.name as name',
          'attendance.checkIn as checkIn',
          'attendance.status as type'
        ])
        .orderBy('attendance.checkIn', 'DESC')
        .limit(10)
        .getRawMany();
      
      console.log(`   - Atividades recentes encontradas: ${recentActivities.length}`);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      recentActivities = [];
    }

    // 6. Estatísticas Semanais
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    // Formatar datas para o formato YYYY-MM-DD para consultas SQL
    const formatDate = (date: Date): string => date.toISOString().split('T')[0];

    // 6.1 Taxa de Presença
    console.log('6.1 Calculando taxa de presença...');
    let totalCheckIns = 0;
    let activeStudentsCount = 0;
    let attendanceRate = 0;
    
    try {
      // Total de check-ins na semana
      totalCheckIns = await attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.checkIn BETWEEN :startDate AND :endDate', {
          startDate: weekStart.toISOString(),
          endDate: now.toISOString()
        })
        .getCount();

      activeStudentsCount = await userRepository.count({
        where: { 
          userType: 'student' as UserRole,
          status: 'active' 
        }
      });

      const maxPossibleCheckIns = activeStudentsCount * 7; // 7 dias na semana
      attendanceRate = maxPossibleCheckIns > 0 
        ? Math.round((totalCheckIns / maxPossibleCheckIns) * 100)
        : 0;
      
      console.log(`   - Taxa de presença: ${attendanceRate}% (${totalCheckIns} check-ins / ${maxPossibleCheckIns} possíveis)`);
    } catch (error) {
      console.error('Erro ao calcular taxa de presença:', error);
    }

    // 6.2 Novos Alunos
    console.log('6.2 Buscando novos alunos...');
    let newStudents = 0;
    try {
      newStudents = await userRepository
        .createQueryBuilder('user')
        .where('user.userType = :userType', { userType: 'student' })
        .andWhere('user.createdAt BETWEEN :startDate AND :endDate', {
          startDate: weekStart.toISOString(),
          endDate: now.toISOString()
        })
        .getCount();
      console.log(`   - Novos alunos: ${newStudents}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar novos alunos:', errorMessage);
      newStudents = 0;
    }

    // Renovações
    let renewals = 0;
    try {
      renewals = await paymentRepository
        .createQueryBuilder('payment')
        .where('payment.paymentDate BETWEEN :startDate AND :endDate', {
          startDate: weekStart.toISOString(),
          endDate: now.toISOString()
        })
        .andWhere('payment.status = :status', { status: 'paid' })
        .getCount();
      console.log(`   - Renovações: ${renewals}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar renovações:', errorMessage);
      renewals = 0;
    }

    // Plano mais vendido (usando query direta por agora)
    let mostPopularPlan = { plan_type: 'Nenhum', count: 0 };
    try {
      const planResult = await AppDataSource.manager.query(
        `SELECT p.name as plan_type, COUNT(*) as count 
         FROM payments py
         JOIN plans p ON py.plan_id = p.id
         WHERE py.payment_date >= ? 
         GROUP BY p.name 
         ORDER BY count DESC 
         LIMIT 1`,
        [formatDate(weekStart)]
      ) as Array<{ plan_type: string; count: string | number }>;
      
      if (planResult && planResult.length > 0) {
        mostPopularPlan = {
          plan_type: planResult[0].plan_type,
          count: typeof planResult[0].count === 'string' 
            ? parseInt(planResult[0].count, 10) 
            : planResult[0].count
        };
      }
      console.log(`   - Plano mais vendido: ${mostPopularPlan.plan_type} (${mostPopularPlan.count} vendas)`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar plano mais vendido:', errorMessage);
    }

    // Horário de pico (usando query direta)
    let peakHour = 18; // Hora padrão 18:00 se não houver dados
    try {
      const peakResult = await AppDataSource.manager.query(
        `SELECT HOUR(check_in) as hour, COUNT(*) as count 
         FROM attendance 
         WHERE check_in >= ? 
         GROUP BY HOUR(check_in) 
         ORDER BY count DESC 
         LIMIT 1`,
        [formatDate(weekStart)]
      ) as Array<{ hour: number }>;
      
      if (peakResult && peakResult.length > 0) {
        peakHour = peakResult[0].hour || 18;
      }
      console.log(`   - Horário de pico: ${peakHour}h`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao buscar horário de pico:', errorMessage);
    }

    // Formatar os dados para o frontend
    const stats = {
      summary: {
        activeStudents: {
          count: activeStudents,
          change: studentGrowth,
          trend: studentGrowth >= 0 ? 'up' : 'down' as const
        },
        monthlyRevenue: {
          amount: parseFloat(String(currentMonthRevenue?.total || '0')) || 0,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down' as const
        },
        todayAttendance: {
          count: todayAttendance,
          change: attendanceChange,
          trend: attendanceChange >= 0 ? 'up' : 'down' as const
        },
        activeWorkouts: {
          count: activeWorkouts,
          change: workoutsChange,
          trend: workoutsChange >= 0 ? 'up' : 'down' as const
        }
      },
      recentActivities: recentActivities ? recentActivities.map(activity => ({
        name: activity?.name || 'Usuário',
        action: activity?.type === 'present' ? 'Check-in realizado' : 'Check-out realizado',
        time: activity?.checkIn ? formatTimeDifference(new Date(activity.checkIn)) : 'Agora mesmo'
      })) : [],
      weeklyStats: {
        attendanceRate: attendanceRate || 0,
        newStudents: newStudents || 0,
        renewals: renewals || 0,
        mostPopularPlan: mostPopularPlan?.plan_type || 'Nenhum',
        peakHour: `${peakHour}h`
      }
    };

    console.log('Dados do dashboard obtidos com sucesso');
    res.json(stats);
  } catch (error: any) {
    console.error('Erro detalhado no getDashboardStats:');
    console.error('Mensagem:', error?.message || 'Erro desconhecido');
    console.error('Stack:', error?.stack);
    
    if ('code' in error) console.error('Código do erro:', (error as any).code);
    if ('sql' in error) {
      console.error('Query SQL:', (error as any).sql);
      console.error('Parâmetros:', (error as any).parameters);
    }
    
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas do dashboard',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Função auxiliar para formatar a diferença de tempo
function formatTimeDifference(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} segundos atrás`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
}
