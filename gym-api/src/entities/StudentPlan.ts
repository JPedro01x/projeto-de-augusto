import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Plan } from './Plan';
import { Payment } from './Payment';

export type StudentPlanStatus = 'active' | 'completed' | 'cancelled';

@Entity('student_plans')
export class StudentPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'student_id' })
  studentId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @Column({ name: 'plan_id' })
  planId!: number;

  @ManyToOne(() => Plan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  })
  status!: StudentPlanStatus;

  @Column({ name: 'plan_type', type: 'varchar', length: 50 })
  planType!: string;

  @OneToMany(() => Payment, payment => payment.studentPlan)
  payments!: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
