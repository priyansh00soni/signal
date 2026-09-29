import { describe, expect, it } from 'vitest'
import { validateHeartbeatBody } from '../src/machines/machines.validation.js'

describe('validateHeartbeatBody', () => {
  it('accepts a valid body with a machineName', () => {
    const errors = validateHeartbeatBody({ machineName: 'server-a' })

    expect(errors).toEqual([]) // no errors = valid
  })

  it('rejects when machineName is missing', () => {
    const errors = validateHeartbeatBody({})

    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects when body is null', () => {
    const errors = validateHeartbeatBody(null)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects when machineName is an empty string', () => {
    const errors = validateHeartbeatBody({ machineName: '   ' })

    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects when machineName is a number instead of a string', () => {
    const errors = validateHeartbeatBody({ machineName: 42 })

    expect(errors.length).toBeGreaterThan(0)
  })
})
