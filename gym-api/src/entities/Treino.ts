import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('treinos')
export class Treino {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;

  @Column()
  categoria: string;

  @Column('simple-json')
  exercicios: Array<{
    nome: string;
    series: number;
    repeticoes: string;
    descanso: string;
  }>;

  @Column({ name: 'aluno_id' })
  alunoId: string;

  @ManyToOne(() => User, user => user.treinosAluno)
  @JoinColumn({ name: 'aluno_id' })
  aluno: User;

  @Column({ name: 'instrutor_id' })
  instrutorId: string;

  @ManyToOne(() => User, user => user.treinosInstrutor)
  @JoinColumn({ name: 'instrutor_id' })
  instrutor: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_criacao: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  data_atualizacao: Date;
}
