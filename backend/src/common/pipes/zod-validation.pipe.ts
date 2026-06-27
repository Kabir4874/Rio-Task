import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'custom') {
      return value;
    }

    // Skip validation for socket.io Client/Socket instance which also has type 'custom'
    if (
      value &&
      typeof value === 'object' &&
      ('conn' in value || 'handshake' in value || 'id' in value)
    ) {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );

      if (metadata.type === 'custom') {
        throw new WsException({
          status: 'error',
          message: 'Validation failed',
          errors: messages,
        });
      }

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }
    return result.data;
  }
}
