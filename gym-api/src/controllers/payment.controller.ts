import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { AppDataSource } from '../data-source';
import { Student } from '../entities/Student';
import { StudentPlan } from '../entities/StudentPlan';

export class PaymentController {
  async recordPayment(req: Request, res: Response) {
    try {
      const { studentId, amount, paymentMethod, notes } = req.body;
      const paymentDate = new Date();
      
      // Get student and their plan
      const student = await AppDataSource.getRepository(Student).findOne({
        where: { userId: studentId },
        relations: ['user']
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const studentPlan = await AppDataSource.getRepository(StudentPlan).findOne({
        where: { studentId, status: 'active' },
        relations: ['plan']
      });

      if (!studentPlan) {
        return res.status(400).json({ error: 'No active plan found for student' });
      }

      const payment = await paymentService.createPayment(
        studentId,
        amount,
        paymentDate,
        paymentMethod,
        studentPlan.planType
      );

      // Update student's next payment date
      student.lastPaymentDate = paymentDate;
      student.nextPaymentDate = paymentService.calculateNextPaymentDate(paymentDate, studentPlan.planType);
      student.paymentStatus = 'paid';
      await AppDataSource.getRepository(Student).save(student);

      res.status(201).json({
        message: 'Payment recorded successfully',
        payment,
        nextPaymentDate: student.nextPaymentDate
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      res.status(500).json({ error: 'Failed to record payment' });
    }
  }

  async getStudentPayments(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const payments = await paymentService.getStudentPayments(parseInt(studentId));
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  }

  async getFinancialReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const report = await paymentService.getFinancialReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(report);
    } catch (error) {
      console.error('Error generating financial report:', error);
      res.status(500).json({ error: 'Failed to generate financial report' });
    }
  }

  async getPendingPayments(req: Request, res: Response) {
    try {
      const pendingPayments = await paymentService.getPendingPayments();
      res.json(pendingPayments);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      res.status(500).json({ error: 'Failed to fetch pending payments' });
    }
  }
}

export const paymentController = new PaymentController();
