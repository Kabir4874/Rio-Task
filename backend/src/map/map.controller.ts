import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { MapService } from './map.service';

@ApiTags('map')
@Controller('map')
@ApiInternalServerErrorResponse({
  description: 'Internal server error occurred',
})
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('active-vehicles')
  @ApiOperation({
    summary: 'Get active tracked vehicles for the user map',
  })
  @ApiOkResponse({
    description: 'Active vehicle location data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 1 },
        vehicles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              vehicle_id: {
                type: 'string',
                example: '8f0a2df3-2d2f-488f-9a42-3a830d676a5b',
              },
              driver_id: {
                type: 'string',
                example: 'd3b07384-d113-4ec6-a558-47babd0e30c2',
              },
              driver_name: { type: 'string', example: 'Rahim Uddin' },
              vehicle_type: { type: 'string', example: 'CNG' },
              vehicle_type_label: { type: 'string', example: 'CNG' },
              details: { type: 'string', example: 'Dhaka Metro CNG 12-3456' },
              is_tracking: { type: 'boolean', example: true },
              lat: { type: 'number', example: 23.7771 },
              lng: { type: 'number', example: 90.3994 },
              last_updated: {
                type: 'string',
                example: '2026-06-26T20:20:32.000Z',
              },
            },
          },
        },
      },
    },
  })
  activeVehicles() {
    return this.mapService.activeVehicles();
  }
}
