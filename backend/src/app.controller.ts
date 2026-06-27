import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiOkResponse({
    description: 'API is healthy and active',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: {
          type: 'string',
          example: 'Rio Deep Live Multi-Vehicle GPS Tracking API',
        },
        timestamp: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred',
  })
  health() {
    return this.appService.health();
  }
}
