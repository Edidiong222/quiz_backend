import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Answer } from './answer.entity';
import { Question } from '../questions/question.entity';

import { CreateAnswerDto } from './dto/create-answer.dto';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

   async findAll() {
    return this.answerRepository.find();
  }

  async create(
    questionId: number,
    createAnswerDto: CreateAnswerDto,
  ) {
    const question = await this.questionRepository.findOne({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.answerRepository.manager.transaction(async manager => {
      if (createAnswerDto.isCorrect) {
        await manager
          .createQueryBuilder()
          .update(Answer)
          .set({ isCorrect: false })
          .where('"questionId" = :questionId', { questionId })
          .execute();
      }

      const answer = manager.create(Answer, {
        ...createAnswerDto,
        question,
      });

      return manager.save(answer);
    });
  }

  async update(answerId: number, updateAnswerDto: Partial<CreateAnswerDto>) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: { question: { answers: true } },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return this.answerRepository.manager.transaction(async manager => {
      if (updateAnswerDto.isCorrect === true) {
        await manager
          .createQueryBuilder()
          .update(Answer)
          .set({ isCorrect: false })
          .where('"questionId" = :questionId', { questionId: answer.question.id })
          .execute();
      }

      if (updateAnswerDto.isCorrect === false && answer.isCorrect) {
        const otherCorrect = answer.question.answers.some(
          item => item.id !== answer.id && item.isCorrect,
        );

        if (!otherCorrect) {
          throw new BadRequestException('A question must have one correct answer');
        }
      }

      Object.assign(answer, updateAnswerDto);

      return manager.save(answer);
    });
  }

  async remove(answerId: number) {
    const answer = await this.answerRepository.findOne({
      where: { id: answerId },
      relations: { question: { answers: true } },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.isCorrect && !answer.question.answers.some(item => item.id !== answer.id && item.isCorrect)) {
      throw new BadRequestException('A question must have one correct answer');
    }

    await this.answerRepository.remove(answer);

    return { deleted: true };
  }
}
