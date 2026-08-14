import {
  IsBoolean,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  answerText!: string;

  @IsBoolean()
  isCorrect!: boolean;
}