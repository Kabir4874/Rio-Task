import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          typeof responseObj.message === 'string' ||
          Array.isArray(responseObj.message)
            ? (responseObj.message as string | string[])
            : exception.message;
        error =
          typeof responseObj.error === 'string'
            ? responseObj.error
            : exception.name;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(`Unknown Exception: ${String(exception)}`);
    }

    const formattedMessage = Array.isArray(message)
      ? message.join(', ')
      : String(message);

    const errorResponse = {
      success: false,
      statusCode: status,
      message: formattedMessage,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} [${request.method}] ${request.url} - Error: ${formattedMessage}`,
      );
    } else {
      this.logger.warn(
        `HTTP ${status} [${request.method}] ${request.url} - Warning: ${formattedMessage}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
