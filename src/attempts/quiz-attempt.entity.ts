import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { AttemptAnswer } from './attempt-answer.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.attempts, {
    onDelete: 'CASCADE',
  })
  quiz!: Quiz;

  @Column({ default: 0 })
  score!: number;

  @Column({ default: 0 })
  totalPoints!: number;

  @Column({ type: 'float', default: 0 })
  percentage!: number;

  @Column({ default: 0 })
  correctAnswers!: number;

  @Column({ default: 0 })
  wrongAnswers!: number;

  @Column({ default: 0 })
  totalQuestions!: number;

  @Column({ default: 0 })
  answeredQuestions!: number;

  @Column({ default: 0 })
  incorrectAnswers!: number;

  @Column({ default: 0 })
  unansweredQuestions!: number;

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @OneToMany(() => AttemptAnswer, (answer) => answer.attempt)
  answers!: AttemptAnswer[];
}
