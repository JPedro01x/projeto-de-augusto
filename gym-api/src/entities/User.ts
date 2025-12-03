import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string = '';

  @Column({ unique: true })
  email: string = '';

  @Column({ name: 'password_hash' })
  password: string = '';

  @Column({ name: 'user_type', type: 'varchar', default: 'student' })
  role: UserRole = 'user';

  @Column({ name: 'status', type: 'varchar', default: 'active' })
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
