import { AppDataSource } from '../data-source';
import { Payment } from '../entities/Payment';
import { StudentPlan } from '../entities/StudentPlan';
import { Student } from '../entities/Student';
import { In } from 'typeorm';
import { addMonths, addYears, isBefore, isAfter, addDays } from 'date-fns';

export class PaymentService {
  private paymentRepository = AppDataSource.getRepository(Payment);
  private studentPlanRepository = AppDataSource.getRepository(StudentPlan);
  private studentRepository = AppDataSource.getRepository(Student);

  async createPayment(studentId: number, amount: number, paymentDate: Date, paymentMethod: string, planType: string) {
    // Find active student plan
    const studentPlan = await this.studentPlanRepository.findOne({
      where: { studentId, status: 'active' },
      relations: ['plan']
    });

    if (!studentPlan) {
      throw new Error('No active plan found for student');
    }

    // Create payment record
    const payment = new Payment();
    payment.studentPlanId = studentPlan.id;
    payment.amount = amount;
    payment.paymentDate = paymentDate;
    payment.paymentMethod = paymentMethod;
    payment.status = 'paid';
    payment.planType = planType as any;
    payment.dueDate = paymentDate; // Same as payment date for manual payments

    // Update student's next payment date based on plan type
    const student = await this.studentRepository.findOneBy({ userId: studentId });
    if (student) {
      student.lastPaymentDate = paymentDate;
      student.nextPaymentDate = this.calculateNextPaymentDate(paymentDate, planType);
      student.paymentStatus = 'paid';
      await this.studentRepository.save(student);
    }

    // Save payment
    return this.paymentRepository.save(payment);
  }

  async getStudentPayments(studentId: number) {
    const studentPlan = await this.studentPlanRepository.findOne({
      where: { studentId },
      relations: ['payments']
    });

    if (!studentPlan) {
      return [];
    }

    return this.paymentRepository.find({
      where: { studentPlanId: studentPlan.id },
      order: { dueDate: 'DESC' }
    });
  }

  async checkAndRenewPlans() {
    const today = new Date();
    const expiringPlans = await this.studentPlanRepository
      .createQueryBuilder('plan')
      .where('plan.endDate <= :today', { today })
      .andWhere('plan.status = :status', { status: 'active' })
      .leftJoinAndSelect('plan.plan', 'planDetails')
      .getMany();

    for (const plan of expiringPlans) {
      // Check if there's a pending payment for renewal
      const pendingPayment = await this.paymentRepository.findOne({
        where: {
          studentPlanId: plan.id,
          status: 'pending',
          dueDate: plan.endDate
        }
      });

      if (pendingPayment) {
        // Update student's payment status to overdue
        await this.studentRepository.update(
          { userId: plan.studentId },
          { paymentStatus: 'overdue' }
        );
      } else {
        // Create a new payment for the next period
        const nextPayment = new Payment();
        nextPayment.studentPlanId = plan.id;
        nextPayment.amount = plan.plan.monthlyPrice;
        nextPayment.dueDate = plan.endDate;
        nextPayment.status = 'pending';
        nextPayment.planType = plan.planType as any;
        
        await this.paymentRepository.save(nextPayment);
      }
    }
  }

  async getFinancialReport(startDate: Date, endDate: Date) {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.studentPlan', 'studentPlan')
      .leftJoinAndSelect('studentPlan.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('payment.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('payment.paymentDate', 'DESC')
      .getMany();

    const totalReceived = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.studentPlan', 'studentPlan')
      .leftJoinAndSelect('studentPlan.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('payment.status = :status', { status: 'pending' })
      .andWhere('payment.dueDate <= :today', { today: new Date() })
      .orderBy('payment.dueDate', 'ASC')
      .getMany();

    const totalPending = pendingPayments
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      payments,
      totalReceived,
      pendingPayments,
      totalPending
    };
  }

  public calculateNextPaymentDate(currentDate: Date, planType: string): Date {
    switch (planType) {
      case 'monthly':
        return addMonths(currentDate, 1);
      case 'quarterly':
        return addMonths(currentDate, 3);
      case 'semiannual':
        return addMonths(currentDate, 6);
      case 'annual':
        return addYears(currentDate, 1);
      default:
        return addMonths(currentDate, 1);
    }
  }

  async getPendingPayments() {
    const today = new Date();
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.studentPlan', 'studentPlan')
      .leftJoinAndSelect('studentPlan.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .where('payment.status = :status', { status: 'pending' })
      .andWhere('payment.dueDate <= :today', { today })
      .orderBy('payment.dueDate', 'ASC')
      .getMany();
  }
}

export const paymentService = new PaymentService();
