import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AddVehicleDto } from './dto/add-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('add')
  add(@Body() dto: AddVehicleDto) {
    return this.vehiclesService.add(dto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':driver_id')
  findByDriver(@Param('driver_id') driverId: string) {
    return this.vehiclesService.findByDriver(driverId);
  }

  @Put('update')
  update(@Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(dto);
  }
}
