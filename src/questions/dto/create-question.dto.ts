import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText!: string;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsInt()
  @Min(1)
  points!: number;

  @IsString()
  @IsOptional()
  explanation?: string;
}
