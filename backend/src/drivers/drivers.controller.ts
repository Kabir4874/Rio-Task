import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { RegisterDriverDto } from './dto/register-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('register')
  register(@Body() dto: RegisterDriverDto) {
    return this.driversService.register(dto);
  }

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':driver_id')
  findById(@Param('driver_id') driverId: string) {
    return this.driversService.findById(driverId);
  }
}
