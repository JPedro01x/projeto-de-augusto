import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Instructor } from './Instructor';
import { Student } from './Student';

export type WorkoutPlanStatus = 'active' | 'inactive' | 'paused' | 'completed';

export interface Exercise {
  nome: string;
  series: number;
  repeticoes: string;
  descanso: string;
}

@Entity('workout_plans')
export class WorkoutPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'student_id' })
  studentId!: number;

  @ManyToOne(() => Student, student => student.workoutPlans)
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'instructor_id' })
  instructorId!: number;

  @ManyToOne(() => Instructor, instructor => instructor.workoutPlans)
  @JoinColumn({ name: 'instructor_id' })
  instructor!: Instructor;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive', 'paused', 'completed'],
    default: 'active'
  })
  status!: WorkoutPlanStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'json', nullable: true })
  exercises?: Exercise[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
