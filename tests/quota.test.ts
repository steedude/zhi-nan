// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InterpretSession } from '@/lib/server/interpret/session'
import { checkInterpretQuota } from '@/lib/server/interpret/quota'

const limiters = vi.hoisted(() => ({
  isMinuteLimited: vi.fn(),
  isAnonDailyLimited: vi.fn(),
  isMemberDailyLimited: vi.fn(),
}))
vi.mock('@/lib/server/rate-limit', () => limiters)
vi.mock('@/lib/server/api-errors', () => ({
  jsonError: (code: string, _locale: string, status: number) =>
    Response.json({ code }, { status }),
}))

describe('quota routing', () => {
  beforeEach(() => {
    for (const limiter of Object.values(limiters))
      limiter.mockReset().mockResolvedValue(false)
  })
  const guest: InterpretSession = { user: null, supabase: null }
  const member = { user: { id: 'member-1' }, supabase: {} } as InterpretSession

  it('consumes member quota by user id without querying deletable readings', async () => {
    expect(
      await checkInterpretQuota({ ip: 'ip-1', locale: 'en', session: member }),
    ).toBeNull()
    expect(limiters.isMemberDailyLimited).toHaveBeenCalledWith('member-1')
    expect(limiters.isAnonDailyLimited).not.toHaveBeenCalled()
  })
  it('returns 429 when the member has exhausted the daily allowance', async () => {
    limiters.isMemberDailyLimited.mockResolvedValue(true)
    const response = await checkInterpretQuota({
      ip: 'ip-1',
      locale: 'en',
      session: member,
    })
    expect(response?.status).toBe(429)
    expect(await response?.json()).toEqual({ code: 'MEMBER_QUOTA_EXCEEDED' })
  })
  it('does not consume daily quota when minute rate limiting already rejects the request', async () => {
    limiters.isMinuteLimited.mockResolvedValue(true)
    expect(
      (await checkInterpretQuota({ ip: 'ip-1', locale: 'en', session: guest }))?.status,
    ).toBe(429)
    expect(limiters.isAnonDailyLimited).not.toHaveBeenCalled()
    expect(limiters.isMemberDailyLimited).not.toHaveBeenCalled()
  })
  it.each(['isMinuteLimited', 'isMemberDailyLimited', 'isAnonDailyLimited'] as const)(
    'returns service unavailable when %s cannot connect to Redis',
    async (limiter) => {
      limiters[limiter].mockRejectedValue(
        new TypeError('fetch failed', {
          cause: Object.assign(new Error('DNS lookup failed'), { code: 'ENOTFOUND' }),
        }),
      )
      const response = await checkInterpretQuota({
        ip: 'ip-1',
        locale: 'en',
        session: limiter === 'isAnonDailyLimited' ? guest : member,
      })
      expect(response?.status).toBe(503)
      expect(await response?.json()).toEqual({ code: 'QUOTA_SERVICE_UNAVAILABLE' })
      if (limiter === 'isMinuteLimited') {
        expect(limiters.isMemberDailyLimited).not.toHaveBeenCalled()
        expect(limiters.isAnonDailyLimited).not.toHaveBeenCalled()
      }
    },
  )
})
