import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('quizzes')
export class QuestionsController {
  constructor(
    private questionsService: QuestionsService,
  ) {}


  @Get(":quizId/questions")
  findAll(@Param('quizId', ParseIntPipe) quizId: number){
    return this.questionsService.findAll(quizId);
  }

  @Post(':quizId/questions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createQuestion(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.questionsService.create(
      quizId,
      createQuestionDto,
    );
  }

  @Patch('questions/:questionId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() updateQuestionDto: Partial<CreateQuestionDto>,
  ) {
    return this.questionsService.update(questionId, updateQuestionDto);
  }

  @Delete('questions/:questionId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  removeQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.questionsService.remove(questionId);
  }

  
}
