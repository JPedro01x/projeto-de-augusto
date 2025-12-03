import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Instructor } from './Instructor';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

<<<<<<< HEAD
@Entity('users')
=======
@Entity()
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string = '';

  @Column({ unique: true })
  email: string = '';

<<<<<<< HEAD
  @Column({ name: 'password_hash' })
  password: string = '';

  @Column({ name: 'user_type', type: 'varchar', default: 'student' })
  role: UserRole = 'user';

  @Column({ name: 'status', type: 'varchar', default: 'active' })
=======
  @Column()
  password: string = '';

  @Column({ type: 'varchar', default: 'user' })
  role: UserRole = 'user';

  @Column({ default: true })
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf
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
