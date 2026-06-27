import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'rio-default-secret-key-12345678',
    });
  }

  async validate(payload: JwtPayload) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: payload.sub },
    });

    if (!driver) {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    return {
      driver_id: driver.id,
      email: driver.email,
      name: driver.name,
    };
  }
}
