import {
  IsEmail,
  IsNotEmpty,
  isNotEmpty,
  MinLength,
  IsString,
  isString,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;
}
