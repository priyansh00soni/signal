import { describe, expect, it } from 'vitest'
import { isMachineOffline } from '../src/machines/isMachineOffline.js'

describe('isMachineOffline', () => {
  it('returns false when machine was seen recently (5 seconds ago)', () => {
    const lastSeen = new Date('2026-01-01T00:00:25Z')
    const now = new Date('2026-01-01T00:00:30Z') // 5s gap — well within 30s threshold

    expect(isMachineOffline(lastSeen, now)).toBe(false)
  })

  it('returns true when machine was seen long ago (5 minutes ago)', () => {
    const lastSeen = new Date('2026-01-01T00:00:00Z')
    const now = new Date('2026-01-01T00:05:00Z') // 300s gap — way past 30s threshold

    expect(isMachineOffline(lastSeen, now)).toBe(true)
  })

  it('returns true at exactly 30 seconds (boundary is inclusive)', () => {
    const lastSeen = new Date('2026-01-01T00:00:00Z')
    const now = new Date('2026-01-01T00:00:30Z') // exactly 30s

    expect(isMachineOffline(lastSeen, now)).toBe(true)
  })

  it('returns false at 29 seconds (one second before threshold)', () => {
    const lastSeen = new Date('2026-01-01T00:00:00Z')
    const now = new Date('2026-01-01T00:00:29Z') // 29s — just under

    expect(isMachineOffline(lastSeen, now)).toBe(false)
  })
})
