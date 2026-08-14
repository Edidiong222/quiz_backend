import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Question } from '../questions/question.entity';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  answerText!: string;

  @Column()
  isCorrect!: boolean;

  @ManyToOne(() => Question, question => question.answers, {
    onDelete: 'CASCADE',
  })
  question!: Question;
}