import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateVehicleDto {
  @IsString()
  @IsNotEmpty()
  vehicle_id: string;

  @IsString()
  @IsNotEmpty()
  vehicle_type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  details: string;
}
