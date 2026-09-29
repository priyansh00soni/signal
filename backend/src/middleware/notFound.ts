import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.js'

// Mounted just before the error handler. Turns any unmatched route into a
// normal 404 ApiError so it flows through the same handler as everything
// else, instead of Express's default HTML error page.
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}
