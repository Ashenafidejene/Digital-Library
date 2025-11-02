import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: any;
}

export class ResponseUtil {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    pagination?: any
  ) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully') {
    this.success(res, data, message, 201);
  }

  static updated<T>(res: Response, data: T, message = 'Resource updated successfully') {
    this.success(res, data, message, 200);
  }

  static deleted(res: Response, message = 'Resource deleted successfully') {
    this.success(res, null, message, 200);
  }

  static paginated<T>(res: Response, data: T, pagination: any, message = 'Success') {
    this.success(res, data, message, 200, pagination);
  }
}
