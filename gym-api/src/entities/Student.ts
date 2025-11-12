import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

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
}
