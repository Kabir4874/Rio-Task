import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const drivers = await this.prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vehicles: true },
    });

    return {
      count: drivers.length,
      drivers: drivers.map((driver) => ({
        ...this.toResponse(driver),
        vehicles: driver.vehicles.map((vehicle) => ({
          vehicle_id: vehicle.id,
          driver_id: vehicle.driverId,
          vehicle_type: vehicle.vehicleType,
          details: vehicle.details,
          is_tracking: vehicle.isTracking,
          created_at: vehicle.createdAt,
          updated_at: vehicle.updatedAt,
        })),
      })),
    };
  }

  async findById(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: { vehicles: true },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return {
      driver: {
        ...this.toResponse(driver),
        vehicles: driver.vehicles.map((vehicle) => ({
          vehicle_id: vehicle.id,
          driver_id: vehicle.driverId,
          vehicle_type: vehicle.vehicleType,
          details: vehicle.details,
          is_tracking: vehicle.isTracking,
          created_at: vehicle.createdAt,
          updated_at: vehicle.updatedAt,
        })),
      },
    };
  }

  private toResponse(driver: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      driver_id: driver.id,
      name: driver.name,
      created_at: driver.createdAt,
      updated_at: driver.updatedAt,
    };
  }
}
