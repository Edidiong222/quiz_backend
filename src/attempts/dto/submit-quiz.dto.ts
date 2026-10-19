import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

class SubmittedAnswerDto {
  @IsInt()
  @Min(1)
  questionId!: number;

  @IsInt()
  @Min(1)
  answerId!: number;
}

export class SubmitQuizDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmittedAnswerDto)
  answers!: SubmittedAnswerDto[];
}
