import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type AttendanceStatus = 'present' | 'absent' | 'justified';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'student_id' })
  studentId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @Column({ name: 'check_in', type: 'datetime' })
  checkIn!: Date;

  @Column({ name: 'check_out', type: 'datetime', nullable: true })
  checkOut!: Date | null;

  @Column({ 
    type: 'enum', 
    enum: ['present', 'absent', 'justified'], 
    default: 'present' 
  })
  status!: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'recorded_by', nullable: true })
  recordedById?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by' })
  recordedBy?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
