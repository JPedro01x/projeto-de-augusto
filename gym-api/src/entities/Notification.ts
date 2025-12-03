import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type NotificationType = 'payment' | 'system' | 'alert';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ 
    type: 'enum', 
    enum: ['payment', 'system', 'alert'],
    default: 'system'
  })
  type!: NotificationType;

  @Column({ name: 'related_id', nullable: true })
  relatedId?: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ default: false })
  read: boolean = false;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Método para formatar a notificação para o frontend
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      message: this.message,
      type: this.type,
      relatedId: this.relatedId,
      userId: this.userId,
      read: this.read,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
