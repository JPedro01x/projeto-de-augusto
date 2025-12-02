import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Instructor } from './Instructor';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string = '';

  @Column({ unique: true })
  email: string = '';

  @Column()
  password: string = '';

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole = 'user';

  @Column({ default: true })
  isActive: boolean = true;

  @Column({ nullable: true })
  cpf?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date = new Date();
}
