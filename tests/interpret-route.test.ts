// @vitest-environment node
import { expect, it, vi } from 'vitest'
import { POST } from '@/app/api/interpret/route'

const mocks = vi.hoisted(() => ({
  computeBazi: vi.fn(),
  createInterpretationResponse: vi.fn(),
}))
vi.mock('@/lib/bazi', () => ({ computeBazi: mocks.computeBazi }))
vi.mock('@/lib/server/ai/gemini', () => ({ hasGeminiApiKey: () => true }))
vi.mock('@/lib/server/interpret/session', () => ({
  getInterpretSession: async () => ({ user: null, supabase: null }),
}))
vi.mock('@/lib/server/interpret/stream', () => ({
  createInterpretationResponse: mocks.createInterpretationResponse,
}))
vi.mock('@/lib/server/rate-limit', () => ({
  isMinuteLimited: async () => {
    throw new TypeError('fetch failed', { cause: new Error('getaddrinfo ENOTFOUND') })
  },
  isAnonDailyLimited: vi.fn(),
  isMemberDailyLimited: vi.fn(),
}))
vi.mock('@/lib/server/api-errors', () => ({
  jsonError: (code: string, _locale: string, status: number) =>
    Response.json({ code }, { status }),
}))

it('returns a specific 503 on Redis DNS failure and does not start AI generation', async () => {
  const response = await POST(
    new Request('http://localhost/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: '工作方向',
        category: '事業工作',
        locale: 'zh-TW',
        year: 1990,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        gender: 'female',
      }),
    }),
  )
  expect(response.status).toBe(503)
  expect(await response.json()).toEqual({ code: 'QUOTA_SERVICE_UNAVAILABLE' })
  expect(mocks.computeBazi).not.toHaveBeenCalled()
  expect(mocks.createInterpretationResponse).not.toHaveBeenCalled()
})
