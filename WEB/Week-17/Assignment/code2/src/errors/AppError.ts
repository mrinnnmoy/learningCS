export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(r = "Resource") {
    super(`${r} not found`, 404);
  }
}
export class UnauthorizedError extends AppError {
  constructor(m = "Unauthorized") {
    super(m, 401);
  }
}
export class ForbiddenError extends AppError {
  constructor(m = "Forbidden") {
    super(m, 403);
  }
}
export class ConflictError extends AppError {
  constructor(m: string) {
    super(m, 409);
  }
}
