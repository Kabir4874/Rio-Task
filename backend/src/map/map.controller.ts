import { Controller, Get } from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('active-vehicles')
  activeVehicles() {
    return this.mapService.activeVehicles();
  }
}
