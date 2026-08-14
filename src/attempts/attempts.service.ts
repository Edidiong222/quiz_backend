import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { QuizAttempt } from './quiz-attempt.entity';
import { AttemptAnswer } from './attempt-answer.entity';

import { Quiz } from '../quizzes/quiz.entity';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';
import { User } from '../users/entities/user.entity';

import { SubmitQuizDto } from './dto/submit-quiz.dto';

interface LeaderboardStats {
  userId: number;
  name: string;
  bestScore: number;
  averageScore: number;
  highScores: number;
  testsTaken: number;
  totalPercentage: number;
}

@Injectable()
export class AttemptsService {
  constructor(
    @InjectRepository(QuizAttempt)
    private attemptRepository: Repository<QuizAttempt>,

    @InjectRepository(AttemptAnswer)
    private attemptAnswerRepository: Repository<AttemptAnswer>,

    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async startQuiz(userId: number, quizId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const attempt = this.attemptRepository.create({
      user,
      quiz,
      score: 0,
      totalPoints: 0,
      percentage: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      totalQuestions: quiz.questions.length,
      answeredQuestions: 0,
      incorrectAnswers: 0,
      unansweredQuestions: quiz.questions.length,
    });

    const saved = await this.attemptRepository.save(attempt);

    return {
      id: saved.id,
      score: saved.score,
      totalPoints: saved.totalPoints,
      percentage: saved.percentage,
      correctAnswers: saved.correctAnswers,
      wrongAnswers: saved.wrongAnswers,
      totalQuestions: saved.totalQuestions,
      answeredQuestions: saved.answeredQuestions,
      incorrectAnswers: saved.incorrectAnswers,
      unansweredQuestions: saved.unansweredQuestions,
      startedAt: saved.startedAt,
      completedAt: saved.completedAt,
    };
  }
  async leaderboard() {
  const attempts = await this.attemptRepository.find({
    where: {
      completedAt: Not(IsNull()),
    },
    relations: {
      user: true,
    },
  });

  const users = new Map<number, LeaderboardStats>();

  for (const attempt of attempts) {
    const userId = attempt.user.id;

    if (!users.has(userId)) {
      users.set(userId, {
        userId,
        name: attempt.user.name,
        bestScore: 0,
        averageScore: 0,
        highScores: 0,
        testsTaken: 0,
        totalPercentage: 0,
      });
    }

    const stats = users.get(userId)!;

    stats.testsTaken++;

    stats.totalPercentage += attempt.percentage;

    if (attempt.percentage > stats.bestScore) {
      stats.bestScore = attempt.percentage;
    }

    if (attempt.percentage >= 80) {
      stats.highScores++;
    }
  }

  const leaderboard = Array.from(users.values()).map(
    user => ({
      ...user,
      averageScore: Number(
        (user.totalPercentage / user.testsTaken).toFixed(2),
      ),
      totalPercentage: undefined,
    }),
  );

  leaderboard.sort((a, b) => {
    if (b.bestScore !== a.bestScore) {
      return b.bestScore - a.bestScore;
    }

    if (b.highScores !== a.highScores) {
      return b.highScores - a.highScores;
    }

    return b.averageScore - a.averageScore;
  });

  return leaderboard.map((user, index) => ({
    rank: index + 1,
    ...user,
  }));
}

  async history(userId: number) {
    const attempts = await this.attemptRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
      quiz: true,
      answers: true,
      },
      order: {
        startedAt: 'DESC',
      },
    });

    return attempts.map(attempt => ({
      id: attempt.id,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        timeLimit: attempt.quiz.timeLimit,
        category: attempt.quiz.category,
        difficulty: attempt.quiz.difficulty,
      },
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      totalQuestions: attempt.totalQuestions || attempt.correctAnswers + attempt.wrongAnswers,
      answeredQuestions: attempt.answeredQuestions || attempt.answers.length,
      incorrectAnswers: attempt.incorrectAnswers || attempt.wrongAnswers,
      unansweredQuestions: attempt.unansweredQuestions,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    }));
  }

  async findOne(userId: number, attemptId: number) {
    const attempt = await this.attemptRepository.findOne({
      where: {
        id: attemptId,
        user: { id: userId },
      },
      relations: {
        quiz: true,
        answers: {
          question: true,
          selectedAnswer: true,
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const quiz = await this.quizRepository.findOne({
      where: { id: attempt.quiz.id },
      relations: {
        questions: {
          answers: true,
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const attemptAnswerByQuestion = new Map(
      attempt.answers.map(answer => [answer.question.id, answer]),
    );

    return {
      id: attempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        category: quiz.category,
        difficulty: quiz.difficulty,
      },
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      totalQuestions: attempt.totalQuestions || quiz.questions.length,
      answeredQuestions: attempt.answeredQuestions || attempt.answers.filter(answer => answer.selectedAnswer).length,
      incorrectAnswers: attempt.incorrectAnswers || attempt.wrongAnswers,
      unansweredQuestions: attempt.unansweredQuestions || Math.max(0, quiz.questions.length - attempt.answers.filter(answer => answer.selectedAnswer).length),
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      answers: quiz.questions.map(question => {
        const answer = attemptAnswerByQuestion.get(question.id);
        const correctAnswer = question?.answers.find(
          item => item.isCorrect,
        );

        return {
          id: answer?.id ?? question.id,
          questionId: question.id,
          questionText: question.questionText,
          selectedAnswer: {
            id: answer?.selectedAnswer?.id ?? null,
            answerText: answer?.selectedAnswer?.answerText ?? 'Unanswered',
          },
          correctAnswer: correctAnswer
            ? {
                id: correctAnswer.id,
                answerText: correctAnswer.answerText,
              }
            : null,
          isCorrect: answer?.isCorrect ?? false,
          pointsEarned: answer?.pointsEarned ?? 0,
          points: question?.points ?? 0,
          explanation: question.explanation,
        };
      }),
    };
  }

  async submitQuiz(
    userId: number,
    attemptId: number,
    submitQuizDto: SubmitQuizDto,
  ) {
    const attempt = await this.attemptRepository.findOne({
      where: {
        id: attemptId,
        user: {
          id: userId,
        },
      },
      relations: {
        quiz: {
          questions: {
            answers: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException(
        'This quiz has already been submitted',
      );
    }

    const questions = attempt.quiz.questions;
    const submittedByQuestion = new Map<number, number>();

    for (const submitted of submitQuizDto.answers) {
      if (submittedByQuestion.has(submitted.questionId)) {
        throw new BadRequestException(
          `Duplicate answer for question ${submitted.questionId}`,
        );
      }
      submittedByQuestion.set(submitted.questionId, submitted.answerId);
    }

    let score = 0;
    let totalPoints = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unansweredQuestions = 0;

    await this.attemptAnswerRepository
      .createQueryBuilder()
      .delete()
      .where('"attemptId" = :attemptId', { attemptId: attempt.id })
      .execute();

    for (const question of questions) {
      totalPoints += question.points;

      const submittedAnswerId = submittedByQuestion.get(question.id);

      const selectedAnswer = submittedAnswerId
        ? question.answers.find(
            answer => answer.id === submittedAnswerId,
          )
        : null;

      if (submittedAnswerId && !selectedAnswer) {
        throw new BadRequestException(
          `Invalid answer for question ${question.id}`,
        );
      }

      const isCorrect = selectedAnswer?.isCorrect ?? false;

      const pointsEarned = isCorrect
        ? question.points
        : 0;

      if (isCorrect) {
        score += pointsEarned;
        correctAnswers++;
      } else if (selectedAnswer) {
        incorrectAnswers++;
      } else {
        unansweredQuestions++;
      }

      const attemptAnswer =
        this.attemptAnswerRepository.create({
          attempt,
          question,
          selectedAnswer,
          isCorrect,
          pointsEarned,
        });

      await this.attemptAnswerRepository.save(
        attemptAnswer,
      );
    }

    

    const percentage =
      totalPoints === 0
        ? 0
        : (score / totalPoints) * 100;

    attempt.score = score;
    attempt.totalPoints = totalPoints;
    attempt.percentage = Number(percentage.toFixed(2));
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = incorrectAnswers;
    attempt.totalQuestions = questions.length;
    attempt.answeredQuestions = questions.length - unansweredQuestions;
    attempt.incorrectAnswers = incorrectAnswers;
    attempt.unansweredQuestions = unansweredQuestions;
    attempt.completedAt = new Date();

    await this.attemptRepository.save(attempt);

    return {
      attemptId: attempt.id,
      score,
      totalPoints,
      percentage: attempt.percentage,
      correctAnswers,
      wrongAnswers: incorrectAnswers,
      totalQuestions: questions.length,
      answeredQuestions: questions.length - unansweredQuestions,
      incorrectAnswers,
      unansweredQuestions,
      completedAt: attempt.completedAt,
    };
  }
}
