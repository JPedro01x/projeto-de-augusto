import { Entity, PrimaryColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Student } from './Student';
import { WorkoutPlan } from './WorkoutPlan';

@Entity('instructors')
export class Instructor {
  @PrimaryColumn({ name: 'user_id' })
  userId!: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 100, nullable: true })
  specialty?: string;

  @Column({ length: 100, nullable: true })
  specialization?: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary?: number;

  @Column({ type: 'text', nullable: true })
  certifications?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'photo_url', length: 255, nullable: true })
  photoUrl?: string;

  // Relacionamento com alunos
  @OneToMany(() => Student, student => student.instructor)
  students?: Student[];

  // Relacionamento com planos de treino
  @OneToMany(() => WorkoutPlan, workoutPlan => workoutPlan.instructor)
  workoutPlans?: WorkoutPlan[];
}
