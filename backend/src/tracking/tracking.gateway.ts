import { UsePipes } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { TrackingService } from './tracking.service';
import { MapService } from '../map/map.service';
import {
  UpdateLocationDto,
  updateLocationSchema,
} from './dto/update-location.dto';
import {
  UpdateTrackingStatusDto,
  updateTrackingStatusSchema,
} from './dto/update-tracking-status.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    credentials: true,
  },
  transports: ['websocket'],
})
export class TrackingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly trackingService: TrackingService,
    private readonly mapService: MapService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const active = await this.mapService.activeVehicles();
      client.emit('activeVehicles', active.vehicles);
    } catch (err) {
      console.error('Error sending initial vehicles:', err);
    }

    // Try to authenticate client
    try {
      const auth = client.handshake.auth as Record<string, unknown> | undefined;
      let token = typeof auth?.token === 'string' ? auth.token : undefined;

      const headers = client.handshake.headers as
        | Record<string, string | undefined>
        | undefined;
      const authHeader = headers?.authorization;
      if (!token && authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (token) {
        const verified = this.jwtService.verify(token) as unknown;
        const payload = verified as Record<string, unknown>;
        if (typeof payload.sub === 'string') {
          const clientData = client.data as Record<string, unknown>;
          clientData.driver_id = payload.sub;
        }
      }
    } catch (err: unknown) {
      // Do not disconnect client since guests connect here too to listen
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(
        `WebSocket authentication failed for socket ID ${client.id}:`,
        errMsg,
      );
    }
  }

  @SubscribeMessage('updateTrackingStatus')
  @UsePipes(new ZodValidationPipe(updateTrackingStatusSchema))
  async handleTrackingStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: UpdateTrackingStatusDto,
  ) {
    const clientData = client.data as Record<string, unknown>;
    const driverId =
      typeof clientData.driver_id === 'string'
        ? clientData.driver_id
        : undefined;
    if (!driverId) {
      throw new WsException(
        'Unauthorized: Missing or invalid authentication token',
      );
    }

    const result = await this.trackingService.updateStatus(dto, driverId);
    const active = await this.mapService.activeVehicles();
    this.server.emit('activeVehicles', active.vehicles);
    return result;
  }

  @SubscribeMessage('updateLocation')
  @UsePipes(new ZodValidationPipe(updateLocationSchema))
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: UpdateLocationDto,
  ) {
    const clientData = client.data as Record<string, unknown>;
    const driverId =
      typeof clientData.driver_id === 'string'
        ? clientData.driver_id
        : undefined;
    if (!driverId) {
      throw new WsException(
        'Unauthorized: Missing or invalid authentication token',
      );
    }

    const result = await this.trackingService.updateLocation(dto, driverId);
    const active = await this.mapService.activeVehicles();
    this.server.emit('activeVehicles', active.vehicles);
    return result;
  }
}
