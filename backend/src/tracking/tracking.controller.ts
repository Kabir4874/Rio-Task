import { Body, Controller, Post } from '@nestjs/common';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('status')
  updateStatus(@Body() dto: UpdateTrackingStatusDto) {
    return this.trackingService.updateStatus(dto);
  }

  @Post('update')
  updateLocation(@Body() dto: UpdateLocationDto) {
    return this.trackingService.updateLocation(dto);
  }
}
