import { BadRequestException } from '@nestjs/common';

export const VEHICLE_TYPE_VALUES = [
  'CAR',
  'MOTORCYCLE',
  'RICKSHAW',
  'CNG',
  'DELIVERY',
  'OTHER',
] as const;

export type VehicleTypeValue = (typeof VEHICLE_TYPE_VALUES)[number];

const VEHICLE_TYPE_ALIASES: Record<string, VehicleTypeValue> = {
  CAR: 'CAR',
  MOTORCYCLE: 'MOTORCYCLE',
  MOTORBIKE: 'MOTORCYCLE',
  BIKE: 'MOTORCYCLE',
  RICKSHAW: 'RICKSHAW',
  CNG: 'CNG',
  DELIVERY: 'DELIVERY',
  DELIVERY_VEHICLE: 'DELIVERY',
  OTHER: 'OTHER',
};

export function normalizeVehicleType(value: string): VehicleTypeValue {
  const key = value
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
  const vehicleType = VEHICLE_TYPE_ALIASES[key];

  if (!vehicleType) {
    throw new BadRequestException({
      message: 'Invalid vehicle_type',
      allowed_values: VEHICLE_TYPE_VALUES,
    });
  }

  return vehicleType;
}

export function formatVehicleType(value: VehicleTypeValue): string {
  const labels: Record<VehicleTypeValue, string> = {
    CAR: 'Car',
    MOTORCYCLE: 'Motorcycle',
    RICKSHAW: 'Rickshaw',
    CNG: 'CNG',
    DELIVERY: 'Delivery',
    OTHER: 'Other',
  };

  return labels[value];
}
