import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static error<T>(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse<T | null> = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      data: null,
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: PaginatedResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }

  static updated<T>(
    res: Response,
    data: T,
    message: string = 'Resource updated successfully'
  ): Response {
    return this.success(res, data, message, 200);
  }

  static deleted(
    res: Response,
    message: string = 'Resource deleted successfully'
  ): Response {
    return this.success(res, null, message, 200);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return this.error(res, message, 401);
  }

  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response {
    return this.error(res, message, 403);
  }

  static badRequest(
    res: Response,
    message: string = 'Bad request',
    error?: string
  ): Response {
    return this.error(res, message, 400, error);
  }

  static conflict(
    res: Response,
    message: string = 'Resource conflict',
    error?: string
  ): Response {
    return this.error(res, message, 409, error);
  }

  static validationError(
    res: Response,
    message: string = 'Validation failed',
    errors?: string[]
  ): Response {
    return this.error(res, message, 422, errors?.join(', '));
  }
}
