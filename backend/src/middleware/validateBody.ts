import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError.js'

// A validator is just a plain function: given the body, return a list of
// field-level error messages (empty array = valid). No schema library —
// each feature writes its own small check function and passes it in here.
type Validator = (body: unknown) => string[]

// Same shape as the guidelines' schema-based version, just swapping
// schema.safeParse for a plain function call.
export const validateBody = (validate: Validator) => (req: Request, _res: Response, next: NextFunction) => {
  const errors = validate(req.body)
  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed', null, errors))
  }
  next()
}
