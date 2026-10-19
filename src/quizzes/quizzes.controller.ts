import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminFindAll() {
    return this.quizzesService.adminFindAll();
  }

  @Get()
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminFindOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.adminFindOne(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuizDto: Partial<CreateQuizDto>,
  ) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.remove(id);
  }
}
