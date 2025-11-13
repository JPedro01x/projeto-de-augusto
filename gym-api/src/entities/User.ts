import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Student } from './Student';
import { Instructor } from './Instructor';

export type UserRole = 'admin' | 'instructor' | 'student';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ length: 14, nullable: true, unique: true })
  cpf?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender?: string;

  @Column({ type: 'enum', enum: ['admin', 'instructor', 'student'], name: 'user_type' })
  userType!: UserRole;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status!: 'active' | 'inactive' | 'suspended';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Student, (student) => student.user)
  student?: Student;

  @OneToOne(() => Instructor, (instructor) => instructor.user)
  instructor?: Instructor;
}
