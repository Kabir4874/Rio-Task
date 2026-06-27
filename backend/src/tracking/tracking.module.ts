import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { MapModule } from '../map/map.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MapModule, AuthModule],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
