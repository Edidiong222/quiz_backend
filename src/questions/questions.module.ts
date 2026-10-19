import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Question } from './question.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Quiz])],

  providers: [QuestionsService],
  controllers: [QuestionsController],

  exports: [QuestionsService],
})
export class QuestionsModule {}
