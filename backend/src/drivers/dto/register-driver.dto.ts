import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterDriverDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;
}
