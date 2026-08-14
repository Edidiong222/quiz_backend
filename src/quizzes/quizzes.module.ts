import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './quiz.entity';
import { QuizzesController } from './quizzes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz]),
  ],
    controllers: [
    QuizzesController,
  ],

   providers: [
    QuizzesService,
  ],

  exports: [
    QuizzesService,
  ],
})
export class QuizzesModule {}