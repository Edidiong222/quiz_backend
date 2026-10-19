import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Quiz } from '../quizzes/quiz.entity';
import { Answer } from '../answers/answer.entity';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  questionText!: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
  })
  difficulty!: Difficulty;

  @Column({ type: 'int', default: 1 })
  points!: number;

  @Column({ type: 'text', nullable: true })
  explanation!: string | null;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, {
    onDelete: 'CASCADE',
  })
  quiz!: Quiz;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers!: Answer[];
}
