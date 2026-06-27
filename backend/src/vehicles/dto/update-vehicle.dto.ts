import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateVehicleSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle UUID format'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  details: z
    .string()
    .min(1, 'Details are required')
    .max(240, 'Details must be at most 240 characters'),
});

export class UpdateVehicleDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  vehicle_id!: string;

  @ApiProperty({
    example: 'Motorcycle',
    description: 'Car, Motorcycle, Rickshaw, CNG, Delivery, or Other',
  })
  vehicle_type!: string;

  @ApiProperty({
    example: 'Yamaha FZ - Dhaka Metro HA 22-3344',
    maxLength: 240,
  })
  details!: string;
}
