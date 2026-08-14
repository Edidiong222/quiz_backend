import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Difficulty } from '../../questions/question.entity';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  timeLimit?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;
}
