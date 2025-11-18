import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Exercicio } from './types';

@Entity('treinos')
export class Treino {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  titulo!: string;

  @Column('text')
  descricao!: string;

  @Column()
  categoria!: string;

  @Column('simple-json')
  exercicios!: Exercicio[];

  @Column({ name: 'aluno_id' })
  alunoId!: string;

  @ManyToOne(() => User, user => user.treinosAluno)
  @JoinColumn({ name: 'aluno_id' })
  aluno!: User;

  @Column({ name: 'instrutor_id' })
  instrutorId!: string;

  @ManyToOne(() => User, user => user.treinosInstrutor)
  @JoinColumn({ name: 'instrutor_id' })
  instrutor!: User;

  @CreateDateColumn({ name: 'data_criacao' })
  data_criacao!: Date;

  @UpdateDateColumn({ name: 'data_atualizacao' })
  data_atualizacao!: Date;
}
