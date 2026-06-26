import { Injectable, NotFoundException } from '@nestjs/common';
import { VehicleTypeValue } from '../common/vehicle-types';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { UpdateTrackingStatusDto } from './dto/update-tracking-status.dto';

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateStatus(dto: UpdateTrackingStatusDto) {
    const vehicle = await this.ensureVehicleExists(dto.vehicle_id);

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id: dto.vehicle_id },
      data: { isTracking: dto.is_tracking },
      include: { driver: true, location: true },
    });

    return {
      message: dto.is_tracking ? 'Tracking started' : 'Tracking stopped',
      vehicle_id: updatedVehicle.id,
      driver_id: vehicle.driverId,
      is_tracking: updatedVehicle.isTracking,
      vehicle: this.vehicleResponse(updatedVehicle),
    };
  }

  async updateLocation(dto: UpdateLocationDto) {
    const vehicle = await this.ensureVehicleExists(dto.vehicle_id);
    const lat = Number(dto.lat);
    const lng = Number(dto.lng);

    const location = await this.prisma.location.upsert({
      where: { vehicleId: dto.vehicle_id },
      create: {
        vehicleId: dto.vehicle_id,
        driverId: vehicle.driverId,
        lat,
        lng,
        lastUpdated: new Date(),
      },
      update: {
        driverId: vehicle.driverId,
        lat,
        lng,
        lastUpdated: new Date(),
      },
      include: {
        vehicle: {
          include: { driver: true },
        },
        driver: true,
      },
    });

    return {
      message: 'Location updated successfully',
      location: {
        vehicle_id: location.vehicleId,
        driver_id: location.driverId,
        driver_name: location.driver.name,
        vehicle_type: location.vehicle.vehicleType,
        details: location.vehicle.details,
        is_tracking: location.vehicle.isTracking,
        lat: location.lat,
        lng: location.lng,
        last_updated: location.lastUpdated,
      },
    };
  }

  private async ensureVehicleExists(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  private vehicleResponse(vehicle: {
    id: string;
    driverId: string;
    vehicleType: VehicleTypeValue;
    details: string;
    isTracking: boolean;
    driver?: { name: string } | null;
    location?: { lat: number; lng: number; lastUpdated: Date } | null;
  }) {
    return {
      vehicle_id: vehicle.id,
      driver_id: vehicle.driverId,
      driver_name: vehicle.driver?.name,
      vehicle_type: vehicle.vehicleType,
      details: vehicle.details,
      is_tracking: vehicle.isTracking,
      location: vehicle.location
        ? {
            lat: vehicle.location.lat,
            lng: vehicle.location.lng,
            last_updated: vehicle.location.lastUpdated,
          }
        : null,
    };
  }
}
