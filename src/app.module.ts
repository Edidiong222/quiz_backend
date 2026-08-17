import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { AttemptsModule } from './attempts/attempts.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // entities: [],
      autoLoadEntities: true,
      synchronize: true,
      // Uses cloud connection string if provided by host
      ...(process.env.DATABASE_URL && { url: process.env.DATABASE_URL }),
    }),
    UsersModule,
    AuthModule,
    QuizzesModule,
    QuestionsModule,
    AnswersModule,
    AttemptsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
