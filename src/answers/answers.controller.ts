import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';

import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('questions')
export class AnswersController {
  constructor(private answersService: AnswersService) {}

  @Get('answers')
  findAll() {
    return this.answersService.findAll();
  }

  @Post(':questionId/answers')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createAnswer(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() createAnswerDto: CreateAnswerDto,
  ) {
    return this.answersService.create(questionId, createAnswerDto);
  }

  @Patch('answers/:answerId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateAnswer(
    @Param('answerId', ParseIntPipe) answerId: number,
    @Body() updateAnswerDto: Partial<CreateAnswerDto>,
  ) {
    return this.answersService.update(answerId, updateAnswerDto);
  }

  @Delete('answers/:answerId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  removeAnswer(@Param('answerId', ParseIntPipe) answerId: number) {
    return this.answersService.remove(answerId);
  }
}
