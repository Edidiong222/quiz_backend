import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { QuizAttempt } from './quiz-attempt.entity';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';

@Entity('attempt_answers')
export class AttemptAnswer {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => QuizAttempt, (attempt) => attempt.answers, {
    onDelete: 'CASCADE',
  })
  attempt!: QuizAttempt;

  @ManyToOne(() => Question, {
    onDelete: 'CASCADE',
  })
  question!: Question;

  @ManyToOne(() => Answer, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  selectedAnswer!: Answer | null;

  @Column()
  isCorrect!: boolean;

  @Column()
  pointsEarned!: number;
}
