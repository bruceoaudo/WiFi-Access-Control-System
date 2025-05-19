// utils/AppError.js
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Distinguish operational errors from programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication Errors
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

// Validation Errors
export class ValidationError extends AppError {
  errors: any;
  constructor(errors: any, message = "Validation failed") {
    super(message, 422);
    this.errors = errors;
  }
}

// Database Errors
export class NotFoundError extends AppError {
  resource: any;
  constructor(resource: any, message = `${resource} not found`) {
    super(message, 404);
    this.resource = resource;
  }
}

// API/Business Logic Errors
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}
