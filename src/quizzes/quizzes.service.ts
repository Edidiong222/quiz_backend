import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quiz } from './quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async findAll() {
    return this.quizRepository.find({
      order: { id: 'DESC' },
    });
  }

  async adminFindAll() {
    return this.quizRepository.find({
      relations: {
        questions: {
          answers: true,
        },
      },
      order: { id: 'DESC' },
    });
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }
  async adminFindOne(id: number) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: {
        questions: {
          answers: true,
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async findOne(id: number) {
    const quiz = await this.quizRepository.findOne({
      where: {
        id,
      },
      relations: {
        questions: {
          answers: true,
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // console.log('QUESTIONS:', quiz.questions);

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      category: quiz.category,
      difficulty: quiz.difficulty,

      questions: quiz.questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        difficulty: question.difficulty,
        points: question.points,

        answers: this.shuffle(question.answers).map((answer) => ({
          id: answer.id,
          answerText: answer.answerText,
        })),
      })),
    };
  }
  async create(createQuizDto: CreateQuizDto) {
    const quiz = this.quizRepository.create(createQuizDto);

    return this.quizRepository.save(quiz);
  }

  async update(id: number, updateQuizDto: Partial<CreateQuizDto>) {
    const quiz = await this.quizRepository.findOne({ where: { id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    Object.assign(quiz, updateQuizDto);

    return this.quizRepository.save(quiz);
  }

  async remove(id: number) {
    const quiz = await this.quizRepository.findOne({ where: { id } });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    await this.quizRepository.remove(quiz);

    return { deleted: true };
  }
}
