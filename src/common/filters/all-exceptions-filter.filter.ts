import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

interface ErrorResponseBody {
  message: string | string[];
  error?: string;
  statusCode: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponseBody = {
      message: "Ocorreu um erro interno no servidor",
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === "object" && responseBody !== null) {
        errorResponse = responseBody as ErrorResponseBody;
      } else if (typeof responseBody === "string") {
        errorResponse = { message: responseBody, statusCode: status };
      }
    }

    let message: string[] = [];

    if (Array.isArray(errorResponse.message)) {
      message = errorResponse.message;
    } else if (typeof errorResponse.message === "string") {
      message = [errorResponse.message];
    } else if (status === 500) {
      message = ["Ocorreu um erro interno no servidor."];
    }

    const responseBody = {
      message,
      error: errorResponse.error || "Internal server error",
      statusCode: status,
    };

    response.status(status).json(responseBody);
  }
}
