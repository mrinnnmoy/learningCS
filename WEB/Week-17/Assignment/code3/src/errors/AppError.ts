export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(r = "Resource") {
    super(`${r} not found`, 404);
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
