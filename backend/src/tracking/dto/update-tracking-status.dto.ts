import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateTrackingStatusDto {
  @IsString()
  @IsNotEmpty()
  vehicle_id: string;

  @IsBoolean()
  is_tracking: boolean;
}
