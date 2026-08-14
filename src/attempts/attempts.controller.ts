import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AttemptsService } from './attempts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

interface AuthenticatedRequest {
  user: {
    id: number;
    userId: number;
    email: string;
    name?: string;
  };
}

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptsController {
  constructor(
    private attemptsService: AttemptsService,
  ) {}

  @Get('leaderboard')
  leaderboard() {
    return this.attemptsService.leaderboard();
  }

  @Get('history')
  history(@Req() req: AuthenticatedRequest) {
    return this.attemptsService.history(req.user.id);
  }

  @Get(':attemptId')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ) {
    return this.attemptsService.findOne(req.user.id, attemptId);
  }

  @Post('quiz/:quizId/start')
  startQuiz(
    @Req() req: AuthenticatedRequest,
    @Param('quizId', ParseIntPipe) quizId: number,
  ) {
    return this.attemptsService.startQuiz(
      req.user.id,
      quizId,
    );
  }

  @Post(':attemptId/submit')
  submitQuiz(
    @Req() req: AuthenticatedRequest,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return this.attemptsService.submitQuiz(
      req.user.id,
      attemptId,
      submitQuizDto,
    );
  }
}
