import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus } from '../entities/Payment';
import { StudentPlan } from '../entities/StudentPlan';
import { User } from '../entities/User';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export const getFinancialSummary = async (req: Request, res: Response) => {
  try {
    const paymentRepository = AppDataSource.getRepository(Payment);
    const studentPlanRepository = AppDataSource.getRepository(StudentPlan);
    const userRepository = AppDataSource.getRepository(User);

    // Datas para os cálculos
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Receita do Mês Atual
    const currentMonthRevenue = await paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentDate BETWEEN :start AND :end', {
        start: currentMonthStart.toISOString(),
        end: now.toISOString()
      })
      .andWhere('payment.status = :status', { status: 'paid' })
      .getRawOne();

    // 2. Receita do Mês Anterior
    const lastMonthRevenue = await paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentDate BETWEEN :start AND :end', {
        start: lastMonthStart.toISOString(),
        end: lastMonthEnd.toISOString()
      })
      .andWhere('payment.status = :status', { status: 'paid' })
      .getRawOne();

    // 3. Pagamentos Pendentes
    const pendingPayments = await paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .where('payment.dueDate >= :today', { today: now.toISOString().split('T')[0] })
      .andWhere('payment.status = :status', { status: 'pending' })
      .getRawOne();

    // 4. Pagamentos Atrasados
    const overduePayments = await paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .where('payment.dueDate < :today', { today: now.toISOString().split('T')[0] })
      .andWhere('payment.status = :status', { status: 'pending' })
      .getRawOne();

    // 5. Taxa de Pagamento em Dia
    const totalPaid = await paymentRepository.count({
      where: { status: 'paid' as PaymentStatus }
    });

    const totalPayments = await paymentRepository.count();
    const paymentRate = totalPayments > 0 
      ? Math.round((totalPaid / totalPayments) * 100) 
      : 0;

    // 6. Últimos Pagamentos
    const recentPayments = await paymentRepository.find({
      relations: ['studentPlan', 'studentPlan.student'],
      where: { 
        status: 'paid' as PaymentStatus,
        paymentDate: Between(
          new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
          now
        )
      },
      order: { paymentDate: 'DESC' },
      take: 10
    });

    // 7. Receita Mensal (últimos 6 meses)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleString('pt-BR', { month: 'long' });
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const revenue = await paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.paymentDate BETWEEN :start AND :end', {
          start: monthStart.toISOString(),
          end: monthEnd.toISOString()
        })
        .andWhere('payment.status = :status', { status: 'paid' })
        .getRawOne();

      monthlyRevenue.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        revenue: parseFloat(revenue?.total || '0')
      });
    }

    // Calcular variação percentual
    const currentRevenue = parseFloat(currentMonthRevenue?.total || '0');
    const previousRevenue = parseFloat(lastMonthRevenue?.total || '0');
    const revenueChange = previousRevenue > 0 
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    // Formatar resposta
    const response = {
      summary: {
        currentMonthRevenue: {
          amount: currentRevenue,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down'
        },
        pendingPayments: {
          amount: parseFloat(pendingPayments?.total || '0'),
          count: parseInt(pendingPayments?.count || '0', 10)
        },
        overduePayments: {
          amount: parseFloat(overduePayments?.total || '0'),
          count: parseInt(overduePayments?.count || '0', 10)
        },
        paymentRate: paymentRate
      },
      recentPayments: recentPayments.map(payment => ({
        studentName: payment.studentPlan?.student?.name || 'Aluno não encontrado',
        planType: payment.planType,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod || 'Não especificado'
      })),
      monthlyRevenue: monthlyRevenue
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(500).json({ message: 'Erro ao buscar resumo financeiro' });
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, studentId } = req.query;
    const paymentRepository = AppDataSource.getRepository(Payment);
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where.paymentDate = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    }
    
    if (studentId) {
      where.studentPlan = { student: { id: Number(studentId) } };
    }
    
    const payments = await paymentRepository.find({
      relations: ['studentPlan', 'studentPlan.student'],
      where,
      order: { dueDate: 'DESC' },
      take: 100
    });
    
    res.json(payments.map(payment => ({
      id: payment.id,
      studentName: payment.studentPlan?.student?.name || 'Aluno não encontrado',
      planType: payment.planType,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod || 'Não especificado'
    })));
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamentos' });
  }
};
