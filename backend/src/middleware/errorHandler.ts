import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.js'

// Mounted last. Any error thrown with next(error) ends up here.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // If we threw an ApiError, use its status code and message.
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: err.data,
      errors: err.errors,
    })
  }

  // Anything else is unexpected — log it and return a generic 500.
  console.error(err)
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: null,
    errors: [],
  })
}
