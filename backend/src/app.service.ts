import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'Rio Deep Live Multi-Vehicle GPS Tracking API',
      timestamp: new Date().toISOString(),
    };
  }
}
