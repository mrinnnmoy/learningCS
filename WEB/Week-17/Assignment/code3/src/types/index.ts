import { AppError } from "../errors/AppError";

// Discriminated union for all function return values.
// Forces callers to check success before accessing data or error.
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number };

// Helper constructors
export const ok = <T>(data: T): Result<T> => ({ success: true, data });
export const err = (error: string, code = 500): Result<never> => ({
  success: false,
  error,
  code,
});

// Order status as a literal union
export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// User-defined type guards
export function isValidStatus(s: string): s is OrderStatus {
  return ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(s);
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}

// Conditional type with infer — extract the resolved type from an async function
export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> =
  T extends (...args: any[]) => Promise<infer R> ? R : never;

export {};
