import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Question } from '../questions/question.entity';
import { QuizAttempt } from '../attempts/quiz-attempt.entity';
import { Difficulty } from '../questions/question.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ type: 'int', nullable: true })
  timeLimit!: number;

  @Column({ nullable: true })
  category!: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
    nullable: true,
  })
  difficulty!: Difficulty | null;

  @OneToMany(() => Question, (question) => question.quiz)
  questions!: Question[];

  @OneToMany(() => QuizAttempt, (attempt) => attempt.quiz)
  attempts!: QuizAttempt[];
}
