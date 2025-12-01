/**
 * Result型パターン - エラーハンドリングの統一
 */

export type Result<T, E = AppError> = Success<T> | Failure<E>

export interface Success<T> {
  readonly success: true
  readonly data: T
}

export interface Failure<E> {
  readonly success: false
  readonly error: E
}

export const Ok = <T>(data: T): Success<T> => ({ success: true, data })
export const Err = <E>(error: E): Failure<E> => ({ success: false, error })

export const isOk = <T, E>(result: Result<T, E>): result is Success<T> => result.success
export const isErr = <T, E>(result: Result<T, E>): result is Failure<E> => !result.success

/**
 * アプリケーション固有のエラー型
 */
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number

  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      statusCode: this.statusCode
    }
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404

  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id '${id}'` : ''} not found`)
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED'
  readonly statusCode = 403

  constructor(message: string = 'Unauthorized access') {
    super(message)
  }
}

export class StorageError extends AppError {
  readonly code = 'STORAGE_ERROR'
  readonly statusCode = 500

  constructor(operation: string, details?: string) {
    super(`Storage operation failed: ${operation}${details ? ` - ${details}` : ''}`)
  }
}

export class BusinessLogicError extends AppError {
  readonly code = 'BUSINESS_LOGIC_ERROR'
  readonly statusCode = 422

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context)
  }
}
