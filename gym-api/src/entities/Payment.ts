import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudentPlan } from './StudentPlan';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export type PlanType = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'trial';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'student_plan_id' })
  studentPlanId!: number;

  @ManyToOne(() => StudentPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_plan_id' })
  studentPlan!: StudentPlan;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'due_date', type: 'date' })
  dueDate!: Date;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate!: Date | null;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'paid', 'overdue', 'cancelled'], 
    default: 'pending' 
  })
  status!: PaymentStatus;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'receipt_url', length: 255, nullable: true })
  receiptUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'plan_type', type: 'varchar', length: 50 })
  planType!: PlanType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
