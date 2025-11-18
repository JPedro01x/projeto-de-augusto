import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('gym_settings')
export class GymSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  email!: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'email_notifications', type: 'boolean', default: true })
  emailNotifications!: boolean;

  @Column({ name: 'sms_notifications', type: 'boolean', default: false })
  smsNotifications!: boolean;

  @Column({ name: 'push_notifications', type: 'boolean', default: true })
  pushNotifications!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
