import { IsLatitude, IsLongitude, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  vehicle_id: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
