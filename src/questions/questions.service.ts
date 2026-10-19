import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from './question.entity';
import { Quiz } from '../quizzes/quiz.entity';

import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async findAll(quizId: number) {
    return this.questionRepository.find({
      where: {
        quiz: { id: quizId },
      },
      relations: {
        answers: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async create(quizId: number, createQuestionDto: CreateQuestionDto) {
    const quiz = await this.quizRepository.findOne({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const question = this.questionRepository.create({
      ...createQuestionDto,
      quiz,
    });

    return this.questionRepository.save(question);
  }

  async update(
    questionId: number,
    updateQuestionDto: Partial<CreateQuestionDto>,
  ) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: { answers: true },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    Object.assign(question, updateQuestionDto);

    return this.questionRepository.save(question);
  }

  async remove(questionId: number) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.questionRepository.remove(question);

    return { deleted: true };
  }
}
