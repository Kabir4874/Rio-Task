import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateTrackingStatusSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle UUID format'),
  is_tracking: z.boolean(),
});

export class UpdateTrackingStatusDto {
  @ApiProperty({ example: 'vehicle-uuid' })
  vehicle_id!: string;

  @ApiProperty({ example: true })
  is_tracking!: boolean;
}
