import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  UpdateLocationDto,
  updateLocationSchema,
} from './dto/update-location.dto';
import {
  UpdateTrackingStatusDto,
  updateTrackingStatusSchema,
} from './dto/update-tracking-status.dto';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { MapService } from '../map/map.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

interface AuthenticatedRequest {
  user: {
    driver_id: string;
    email: string;
    name: string;
  };
}

@ApiTags('tracking')
@Controller('tracking')
@UseGuards(JwtAuthGuard)
@ApiInternalServerErrorResponse({
  description: 'Internal server error occurred',
})
@ApiTooManyRequestsResponse({ description: 'Rate limit exceeded' })
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway,
    private readonly mapService: MapService,
  ) {}

  @Post('status')
  @ApiOperation({ summary: 'Start or stop vehicle tracking' })
  @ApiOkResponse({
    description: 'Vehicle tracking status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tracking started' },
        vehicle_id: {
          type: 'string',
          example: '8f0a2df3-2d2f-488f-9a42-3a830d676a5b',
        },
        driver_id: {
          type: 'string',
          example: 'd3b07384-d113-4ec6-a558-47babd0e30c2',
        },
        is_tracking: { type: 'boolean', example: true },
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
            details: { type: 'string', example: 'Dhaka Metro CNG 12-3456' },
            is_tracking: { type: 'boolean', example: true },
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
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. invalid status or UUID)',
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found with provided UUID' })
  @UsePipes(new ZodValidationPipe(updateTrackingStatusSchema))
  async updateStatus(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateTrackingStatusDto,
  ) {
    const result = await this.trackingService.updateStatus(
      dto,
      req.user.driver_id,
    );

    // Broadcast update via WebSocket
    try {
      const active = await this.mapService.activeVehicles();
      this.trackingGateway.server.emit('activeVehicles', active.vehicles);
    } catch (err) {
      console.error('Socket broadcast failed:', err);
    }

    return result;
  }

  @Post('update')
  @ApiOperation({ summary: 'Update the latest vehicle GPS coordinates' })
  @ApiOkResponse({
    description: 'Vehicle GPS coordinates updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Location updated successfully' },
        location: {
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
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (e.g. invalid latitude/longitude)',
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found with provided UUID' })
  @UsePipes(new ZodValidationPipe(updateLocationSchema))
  async updateLocation(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateLocationDto,
  ) {
    const result = await this.trackingService.updateLocation(
      dto,
      req.user.driver_id,
    );

    // Broadcast update via WebSocket
    try {
      const active = await this.mapService.activeVehicles();
      this.trackingGateway.server.emit('activeVehicles', active.vehicles);
    } catch (err) {
      console.error('Socket broadcast failed:', err);
    }

    return result;
  }
}
