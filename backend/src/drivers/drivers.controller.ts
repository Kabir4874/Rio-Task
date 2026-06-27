import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
} from '@nestjs/swagger';
import { DriversService } from './drivers.service';

@ApiTags('drivers')
@Controller('drivers')
@ApiInternalServerErrorResponse({
  description: 'Internal server error occurred',
})
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered drivers' })
  @ApiOkResponse({
    description: 'List of drivers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 1 },
        drivers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              driver_id: {
                type: 'string',
                example: 'd3b07384-d113-4ec6-a558-47babd0e30c2',
              },
              name: { type: 'string', example: 'Rahim Uddin' },
              created_at: {
                type: 'string',
                example: '2026-06-26T20:20:32.000Z',
              },
              updated_at: {
                type: 'string',
                example: '2026-06-26T20:20:32.000Z',
              },
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
                    vehicle_type: { type: 'string', example: 'CNG' },
                    details: {
                      type: 'string',
                      example: 'Dhaka Metro CNG 12-3456',
                    },
                    is_tracking: { type: 'boolean', example: false },
                    created_at: {
                      type: 'string',
                      example: '2026-06-26T20:20:32.000Z',
                    },
                    updated_at: {
                      type: 'string',
                      example: '2026-06-26T20:20:32.000Z',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':driver_id')
  @ApiOperation({ summary: 'Get one driver and their connected vehicles' })
  @ApiParam({
    name: 'driver_id',
    type: 'string',
    description: 'UUID of the driver',
  })
  @ApiOkResponse({
    description: 'Driver details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        driver: {
          type: 'object',
          properties: {
            driver_id: {
              type: 'string',
              example: 'd3b07384-d113-4ec6-a558-47babd0e30c2',
            },
            name: { type: 'string', example: 'Rahim Uddin' },
            created_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
            updated_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
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
                  vehicle_type: { type: 'string', example: 'CNG' },
                  details: {
                    type: 'string',
                    example: 'Dhaka Metro CNG 12-3456',
                  },
                  is_tracking: { type: 'boolean', example: false },
                  created_at: {
                    type: 'string',
                    example: '2026-06-26T20:20:32.000Z',
                  },
                  updated_at: {
                    type: 'string',
                    example: '2026-06-26T20:20:32.000Z',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Driver not found with the provided UUID',
  })
  findById(@Param('driver_id') driverId: string) {
    return this.driversService.findById(driverId);
  }
}
