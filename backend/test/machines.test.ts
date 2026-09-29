import { describe, expect, it } from 'vitest'
import { ApiError } from '../src/utils/ApiError.js'

describe('ApiError', () => {
  it('stores the status code and message', () => {
    const error = new ApiError(404, 'Machine not found')

    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Machine not found')
    expect(error.success).toBe(false)
  })

  it('is an instance of Error so it works with throw/catch', () => {
    const error = new ApiError(500, 'Server broke')

    expect(error).toBeInstanceOf(Error)
  })
})
