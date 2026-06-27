import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const addVehicleSchema = z.object({
  driver_id: z.string().uuid('Invalid driver UUID format').optional(),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  details: z
    .string()
    .min(1, 'Details are required')
    .max(240, 'Details must be at most 240 characters'),
});

export class AddVehicleDto {
  @ApiProperty({ example: 'driver-uuid', required: false })
  driver_id?: string;

  @ApiProperty({
    example: 'CNG',
    description: 'Car, Motorcycle, Rickshaw, CNG, Delivery, or Other',
  })
  vehicle_type!: string;

  @ApiProperty({
    example: 'Dhaka Metro CNG 12-3456',
    maxLength: 240,
  })
  details!: string;
}
