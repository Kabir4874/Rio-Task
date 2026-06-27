import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDriverDto,
  registerDriverSchema,
} from '../drivers/dto/register-driver.dto';
import { LoginDriverDto, loginDriverSchema } from './dto/login-driver.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new driver profile with email/password',
  })
  @ApiCreatedResponse({
    description: 'Driver profile registered successfully, returns access token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Driver registered successfully' },
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
        driver_id: { type: 'string', example: '8f0a2df3-2d2f-488f-9a42...' },
        driver: {
          type: 'object',
          properties: {
            driver_id: {
              type: 'string',
              example: '8f0a2df3-2d2f-488f-9a42...',
            },
            name: { type: 'string', example: 'Rahim Uddin' },
            email: { type: 'string', example: 'driver@rio.com' },
            created_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
            updated_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
          },
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email address is already registered' })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. invalid email format)',
  })
  @UsePipes(new ZodValidationPipe(registerDriverSchema))
  register(@Body() dto: RegisterDriverDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login using email and password' })
  @ApiCreatedResponse({
    description: 'Logged in successfully, returns access token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged in successfully' },
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
        driver_id: { type: 'string', example: '8f0a2df3-2d2f-488f-9a42...' },
        driver: {
          type: 'object',
          properties: {
            driver_id: {
              type: 'string',
              example: '8f0a2df3-2d2f-488f-9a42...',
            },
            name: { type: 'string', example: 'Rahim Uddin' },
            email: { type: 'string', example: 'driver@rio.com' },
            created_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
            updated_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @UsePipes(new ZodValidationPipe(loginDriverSchema))
  login(@Body() dto: LoginDriverDto) {
    return this.authService.login(dto);
  }
}
