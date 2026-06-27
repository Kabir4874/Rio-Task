import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

function parseCorsOrigins(value?: string) {
  if (!value || value.trim() === '*') {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Trust proxy for secure behind-load-balancer rate limiting
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: parseCorsOrigins(configService.get<string>('CORS_ORIGIN')),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Register senior architecture cross-cutting concerns
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Rio Deep Live Multi-Vehicle GPS Tracking API')
    .setDescription(
      'REST APIs for driver registration, vehicle management, simulated tracking, and active vehicle map data.',
    )
    .setVersion('1.0.0')
    .addTag('health')
    .addTag('drivers')
    .addTag('vehicles')
    .addTag('tracking')
    .addTag('map')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
void bootstrap();
