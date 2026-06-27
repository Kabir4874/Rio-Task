import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateLocationSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle UUID format'),
  lat: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

export class UpdateLocationDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  vehicle_id!: string;

  @ApiProperty({ example: 23.7771 })
  lat!: number;

  @ApiProperty({ example: 90.3994 })
  lng!: number;
}
