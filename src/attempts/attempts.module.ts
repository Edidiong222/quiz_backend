import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuizAttempt } from './quiz-attempt.entity';
import { AttemptAnswer } from './attempt-answer.entity';

import { Quiz } from '../quizzes/quiz.entity';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';
import { User } from '../users/entities/user.entity';

import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizAttempt,
      AttemptAnswer,
      Quiz,
      Question,
      Answer,
      User,
    ]),
  ],

  controllers: [
    AttemptsController,
  ],

  providers: [
    AttemptsService,
  ],
})
export class AttemptsModule {}