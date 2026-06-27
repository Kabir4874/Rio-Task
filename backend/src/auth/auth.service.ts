import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDriverDto } from '../drivers/dto/register-driver.dto';
import { LoginDriverDto } from './dto/login-driver.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDriverDto) {
    const existing = await this.prisma.driver.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email address is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const driver = await this.prisma.driver.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    const payload = { sub: driver.id, email: driver.email, name: driver.name };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Driver registered successfully',
      access_token: token,
      driver_id: driver.id,
      driver: {
        driver_id: driver.id,
        name: driver.name,
        email: driver.email,
        created_at: driver.createdAt,
        updated_at: driver.updatedAt,
      },
    };
  }

  async login(dto: LoginDriverDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!driver) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, driver.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: driver.id, email: driver.email, name: driver.name };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Logged in successfully',
      access_token: token,
      driver_id: driver.id,
      driver: {
        driver_id: driver.id,
        name: driver.name,
        email: driver.email,
        created_at: driver.createdAt,
        updated_at: driver.updatedAt,
      },
    };
  }
}
