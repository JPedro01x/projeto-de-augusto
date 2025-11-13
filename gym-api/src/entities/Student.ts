import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Instructor } from './Instructor';
import { WorkoutPlan } from './WorkoutPlan';

@Entity('students')
export class Student {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId!: number;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'emergency_contact_name', length: 100, nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', length: 20, nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'health_conditions', type: 'text', nullable: true })
  healthConditions?: string;

  @Column({ name: 'registration_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  registrationDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'instructor_id', nullable: true })
  instructorId?: number;

  @ManyToOne(() => Instructor, instructor => instructor.students, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'instructor_id' })
  instructor?: Instructor;

  @OneToMany(() => WorkoutPlan, workoutPlan => workoutPlan.student)
  workoutPlans?: WorkoutPlan[];

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: 'plan_type', type: 'varchar', length: 50, nullable: true })
  planType?: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'payment_status', type: 'varchar', length: 50, nullable: true })
  paymentStatus?: string;

  @Column({ name: 'last_payment_date', type: 'date', nullable: true })
  lastPaymentDate?: Date;

  @Column({ name: 'next_payment_date', type: 'date', nullable: true })
  nextPaymentDate?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender?: string;
}
