import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StudentPlan } from './StudentPlan';

export type PlanStatus = 'active' | 'inactive';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'monthly_price', type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice!: number;

  @Column({ name: 'duration_days' })
  durationDays!: number;

  @Column({ type: 'text', nullable: true })
  benefits?: string;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive'], 
    default: 'active' 
  })
  status!: PlanStatus;

  @OneToMany(() => StudentPlan, studentPlan => studentPlan.plan)
  studentPlans!: StudentPlan[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
