import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AddVehicleDto, addVehicleSchema } from './dto/add-vehicle.dto';
import {
  UpdateVehicleDto,
  updateVehicleSchema,
} from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

interface AuthenticatedRequest {
  user: {
    driver_id: string;
    email: string;
    name: string;
  };
}

@ApiTags('vehicles')
@Controller('vehicles')
@ApiInternalServerErrorResponse({
  description: 'Internal server error occurred',
})
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add a vehicle connected to a driver' })
  @ApiCreatedResponse({
    description: 'Vehicle added successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vehicle added successfully' },
        vehicle_id: {
          type: 'string',
          example: '8f0a2df3-2d2f-488f-9a42-3a830d676a5b',
        },
        vehicle: {
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
            is_tracking: { type: 'boolean', example: false },
            location: {
              type: 'object',
              nullable: true,
              properties: {
                lat: { type: 'number', example: 23.7771 },
                lng: { type: 'number', example: 90.3994 },
                last_updated: {
                  type: 'string',
                  example: '2026-06-26T20:20:32.000Z',
                },
              },
            },
            created_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
            updated_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. invalid type or details)',
  })
  @ApiNotFoundResponse({ description: 'Driver not found with provided UUID' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(addVehicleSchema))
  add(@Request() req: AuthenticatedRequest, @Body() dto: AddVehicleDto) {
    dto.driver_id = req.user.driver_id;
    return this.vehiclesService.add(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vehicles' })
  @ApiOkResponse({
    description: 'List of vehicles retrieved successfully',
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
              is_tracking: { type: 'boolean', example: false },
              location: {
                type: 'object',
                nullable: true,
                properties: {
                  lat: { type: 'number', example: 23.7771 },
                  lng: { type: 'number', example: 90.3994 },
                  last_updated: {
                    type: 'string',
                    example: '2026-06-26T20:20:32.000Z',
                  },
                },
              },
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
  })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List vehicles registered under the authenticated driver',
  })
  @ApiOkResponse({
    description: 'Driver vehicles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        driver_id: {
          type: 'string',
          example: 'd3b07384-d113-4ec6-a558-47babd0e30c2',
        },
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
              is_tracking: { type: 'boolean', example: false },
              location: {
                type: 'object',
                nullable: true,
                properties: {
                  lat: { type: 'number', example: 23.7771 },
                  lng: { type: 'number', example: 90.3994 },
                  last_updated: {
                    type: 'string',
                    example: '2026-06-26T20:20:32.000Z',
                  },
                },
              },
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
  })
  findMyVehicles(@Request() req: AuthenticatedRequest) {
    return this.vehiclesService.findByDriver(req.user.driver_id);
  }

  @Get(':driver_id')
  @ApiOperation({ summary: 'List vehicles registered under one driver' })
  @ApiParam({
    name: 'driver_id',
    type: 'string',
    description: 'UUID of the driver',
  })
  @ApiOkResponse({
    description: 'Driver vehicles retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        driver_id: {
          type: 'string',
          example: 'd3b07384-d113-4ec6-a558-47babd0e30c2',
        },
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
              is_tracking: { type: 'boolean', example: false },
              location: {
                type: 'object',
                nullable: true,
                properties: {
                  lat: { type: 'number', example: 23.7771 },
                  lng: { type: 'number', example: 90.3994 },
                  last_updated: {
                    type: 'string',
                    example: '2026-06-26T20:20:32.000Z',
                  },
                },
              },
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
  })
  @ApiNotFoundResponse({ description: 'Driver not found with provided UUID' })
  findByDriver(@Param('driver_id') driverId: string) {
    return this.vehiclesService.findByDriver(driverId);
  }

  @Put('update')
  @ApiOperation({ summary: 'Update vehicle type and details' })
  @ApiOkResponse({
    description: 'Vehicle updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Vehicle updated successfully' },
        vehicle: {
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
            details: {
              type: 'string',
              example: 'Dhaka Metro CNG 12-3456 (Updated)',
            },
            is_tracking: { type: 'boolean', example: false },
            location: {
              type: 'object',
              nullable: true,
              properties: {
                lat: { type: 'number', example: 23.7771 },
                lng: { type: 'number', example: 90.3994 },
                last_updated: {
                  type: 'string',
                  example: '2026-06-26T20:20:32.000Z',
                },
              },
            },
            created_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
            updated_at: { type: 'string', example: '2026-06-26T20:20:32.000Z' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. invalid type or details)',
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found with provided UUID' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateVehicleSchema))
  update(@Request() req: AuthenticatedRequest, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(req.user.driver_id, dto);
  }
}
