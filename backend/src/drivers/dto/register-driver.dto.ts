import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const registerDriverSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name must be at most 120 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export class RegisterDriverDto {
  @ApiProperty({ example: 'Rahim Uddin', maxLength: 120 })
  name!: string;

  @ApiProperty({ example: 'driver@rio.com' })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  password!: string;
}
