import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus } from '../entities/Payment';
import { StudentPlan } from '../entities/StudentPlan';
import { User } from '../entities/User';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { notificationService } from '../services/notification.service';

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
      studentId: payment.studentPlan?.student?.id,
      studentName: payment.studentPlan?.student?.name || 'Aluno não encontrado',
      planType: payment.planType,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod || 'Não especificado',
      notes: payment.notes
    })));
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamentos' });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentRepository = AppDataSource.getRepository(Payment);
    
    const payment = await paymentRepository.findOne({
      where: { id: Number(id) },
      relations: ['studentPlan', 'studentPlan.student']
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    
    res.json({
      id: payment.id,
      studentId: payment.studentPlan?.student?.id,
      studentName: payment.studentPlan?.student?.name || 'Aluno não encontrado',
      planType: payment.planType,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod || 'Não especificado',
      notes: payment.notes,
      receiptUrl: payment.receiptUrl
    });
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamento' });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { studentPlanId, amount, dueDate, paymentDate, status, paymentMethod, notes } = req.body;
    const paymentRepository = AppDataSource.getRepository(Payment);
    const studentPlanRepository = AppDataSource.getRepository(StudentPlan);
    
    // Verificar se o plano do aluno existe
    const studentPlan = await studentPlanRepository.findOne({
      where: { id: studentPlanId },
      relations: ['student']
    });
    
    if (!studentPlan) {
      return res.status(404).json({ message: 'Plano do aluno não encontrado' });
    }
    
    // Criar o pagamento
    const payment = paymentRepository.create({
      studentPlanId,
      amount,
      dueDate: new Date(dueDate),
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      status: status || 'pending',
      paymentMethod,
      notes,
      planType: studentPlan.planType as any
    });
    
    await paymentRepository.save(payment);
    
    res.status(201).json({
      id: payment.id,
      studentId: studentPlan.student?.id,
      studentName: studentPlan.student?.name || 'Aluno não encontrado',
      planType: payment.planType,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento' });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, dueDate, paymentDate, status, paymentMethod, notes } = req.body;
    const paymentRepository = AppDataSource.getRepository(Payment);
    
    const payment = await paymentRepository.findOne({
      where: { id: Number(id) },
      relations: ['studentPlan', 'studentPlan.student']
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    
    // Atualizar campos do pagamento
    if (amount !== undefined) payment.amount = amount;
    if (dueDate) payment.dueDate = new Date(dueDate);
    if (paymentDate !== undefined) payment.paymentDate = paymentDate ? new Date(paymentDate) : null;
    if (status) payment.status = status as PaymentStatus;
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (notes !== undefined) payment.notes = notes;
    
    await paymentRepository.save(payment);
    
    res.json({
      id: payment.id,
      studentId: payment.studentPlan?.student?.id,
      studentName: payment.studentPlan?.student?.name || 'Aluno não encontrado',
      planType: payment.planType,
      dueDate: payment.dueDate,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes
    });
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar pagamento' });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentRepository = AppDataSource.getRepository(Payment);
    
    const payment = await paymentRepository.findOne({
      where: { id: Number(id) }
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
    
    await paymentRepository.remove(payment);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    res.status(500).json({ message: 'Erro ao excluir pagamento' });
  }
};

// Solicitar pagamento (criar uma cobrança)
export const requestPayment = async (req: Request, res: Response) => {
  try {
    const { studentId, amount, dueDate, description } = req.body;
    
    if (!studentId || !amount || !dueDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Dados incompletos. Forneça studentId, amount e dueDate.' 
      });
    }

    const studentPlanRepository = AppDataSource.getRepository(StudentPlan);
    const paymentRepository = AppDataSource.getRepository(Payment);
    
    // Encontrar o plano ativo do aluno
    const studentPlan = await studentPlanRepository
      .createQueryBuilder('studentPlan')
      .leftJoinAndSelect('studentPlan.student', 'student')
      .leftJoinAndSelect('studentPlan.plan', 'plan')
      .where('student.id = :studentId', { studentId })
      .andWhere('studentPlan.status = :status', { status: 'active' })
      .orderBy('studentPlan.endDate', 'DESC')
      .getOne();

    if (!studentPlan) {
      return res.status(404).json({ 
        success: false,
        message: 'Nenhum plano ativo encontrado para este aluno' 
      });
    }

    // Mapear o tipo de plano para um valor válido do enum
    const planType = (studentPlan.planType?.toLowerCase() || 'monthly') as 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'trial';
    
    // Criar o pagamento pendente
    const payment = paymentRepository.create({
      studentPlan,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      status: 'pending' as PaymentStatus,
      planType: planType,
      notes: description || 'Cobrança de mensalidade',
      paymentMethod: 'pendente',
      receiptUrl: ''
    });

    const savedPayment = await paymentRepository.save(payment);

    // Enviar notificação para o aluno sobre a nova cobrança
    try {
      await notificationService.notifyNewPayment(
        studentPlan.student.id,
        savedPayment.id,
        savedPayment.amount,
        savedPayment.dueDate
      );
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      // Não queremos falhar a operação principal se a notificação falhar
    }
    
    res.status(201).json({
      success: true,
      message: 'Cobrança criada com sucesso',
      paymentId: payment.id
    });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao processar a solicitação de cobrança' 
    });
  }
};
