import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  formatVehicleType,
  normalizeVehicleType,
  VehicleTypeValue,
} from '../common/vehicle-types';
import { PrismaService } from '../prisma/prisma.service';
import { AddVehicleDto } from './dto/add-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(dto: AddVehicleDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driver_id },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        driverId: dto.driver_id!,
        vehicleType: normalizeVehicleType(dto.vehicle_type),
        details: dto.details.trim(),
        isTracking: false,
      },
      include: { driver: true, location: true },
    });

    return {
      message: 'Vehicle added successfully',
      vehicle_id: vehicle.id,
      vehicle: this.toResponse(vehicle),
    };
  }

  async findByDriver(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    let vehicles = await this.prisma.vehicle.findMany({
      where: { driverId },
      orderBy: { createdAt: 'desc' },
      include: { driver: true, location: true },
    });
    const activeVehicles = vehicles.filter((vehicle) => vehicle.isTracking);

    if (activeVehicles.length > 1) {
      const latestActiveVehicle = activeVehicles.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      )[0];

      await this.prisma.vehicle.updateMany({
        where: {
          driverId,
          isTracking: true,
          id: { not: latestActiveVehicle.id },
        },
        data: { isTracking: false },
      });

      vehicles = vehicles.map((vehicle) => ({
        ...vehicle,
        isTracking: vehicle.id === latestActiveVehicle.id,
      }));
    }

    return {
      driver_id: driverId,
      count: vehicles.length,
      vehicles: vehicles.map((vehicle) => this.toResponse(vehicle)),
    };
  }

  async update(driverId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.ensureVehicleExists(dto.vehicle_id);

    if (vehicle.driverId !== driverId) {
      throw new ForbiddenException('You do not own this vehicle');
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id: dto.vehicle_id },
      data: {
        vehicleType: normalizeVehicleType(dto.vehicle_type),
        details: dto.details.trim(),
      },
      include: { driver: true, location: true },
    });

    return {
      message: 'Vehicle updated successfully',
      vehicle: this.toResponse(updatedVehicle),
    };
  }

  async findAll() {
    const vehicles = await this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: { driver: true, location: true },
    });

    return {
      count: vehicles.length,
      vehicles: vehicles.map((vehicle) => this.toResponse(vehicle)),
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

  private toResponse(vehicle: {
    id: string;
    driverId: string;
    vehicleType: VehicleTypeValue;
    details: string;
    isTracking: boolean;
    createdAt: Date;
    updatedAt: Date;
    driver?: { id: string; name: string } | null;
    location?: { lat: number; lng: number; lastUpdated: Date } | null;
  }) {
    return {
      vehicle_id: vehicle.id,
      driver_id: vehicle.driverId,
      driver_name: vehicle.driver?.name,
      vehicle_type: vehicle.vehicleType,
      vehicle_type_label: formatVehicleType(vehicle.vehicleType),
      details: vehicle.details,
      is_tracking: vehicle.isTracking,
      location: vehicle.location
        ? {
            lat: vehicle.location.lat,
            lng: vehicle.location.lng,
            last_updated: vehicle.location.lastUpdated,
          }
        : null,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    };
  }
}
