// Custom error class so services/controllers can `throw` instead of
// reaching into res.status(...).json(...) directly. The error handler
// middleware knows how to turn this into the standard response envelope.
export class ApiError extends Error {
  statusCode: number
  data: unknown
  success: false
  errors: unknown[]

  constructor(statusCode: number, message = 'Something went wrong', data: unknown = null, errors: unknown[] = []) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    this.success = false
    this.errors = errors
  }
}
