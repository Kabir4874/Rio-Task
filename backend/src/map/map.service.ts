import { Injectable } from '@nestjs/common';
import { formatVehicleType } from '../common/vehicle-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async activeVehicles() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        isTracking: true,
        location: {
          isNot: null,
        },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        driver: true,
        location: true,
      },
    });

    const latestVehicleByDriver = new Map<string, (typeof vehicles)[number]>();
    vehicles.forEach((vehicle) => {
      if (!latestVehicleByDriver.has(vehicle.driverId)) {
        latestVehicleByDriver.set(vehicle.driverId, vehicle);
      }
    });
    const activeVehicles = [...latestVehicleByDriver.values()];

    return {
      count: activeVehicles.length,
      vehicles: activeVehicles.map((vehicle) => ({
        vehicle_id: vehicle.id,
        driver_id: vehicle.driverId,
        driver_name: vehicle.driver.name,
        vehicle_type: vehicle.vehicleType,
        vehicle_type_label: formatVehicleType(vehicle.vehicleType),
        details: vehicle.details,
        is_tracking: vehicle.isTracking,
        lat: vehicle.location?.lat,
        lng: vehicle.location?.lng,
        last_updated: vehicle.location?.lastUpdated,
      })),
    };
  }
}
