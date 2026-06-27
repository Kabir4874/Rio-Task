import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const loginDriverSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export class LoginDriverDto {
  @ApiProperty({ example: 'driver@rio.com' })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  password!: string;
}
