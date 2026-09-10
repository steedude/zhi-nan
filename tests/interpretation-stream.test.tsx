import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useInterpretationStream } from '@/hooks/useInterpretationStream'
import type { InterpretPayload } from '@/types/reading'

const payload: InterpretPayload = {
  question: '工作方向',
  category: '事業工作',
  locale: 'zh-TW',
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  gender: 'female',
}
const options = { payload, fallbackError: 'Unknown', networkError: 'Disconnected' }
afterEach(() => vi.unstubAllGlobals())

describe('interpretation stream', () => {
  it('reassembles Chinese characters split across chunks', async () => {
    const bytes = new TextEncoder().encode('【方向】一步一步來')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            start(controller) {
              for (const byte of bytes) controller.enqueue(new Uint8Array([byte]))
              controller.close()
            },
          }),
        ),
      ),
    )
    const { result } = renderHook(() => useInterpretationStream())
    let text = ''
    await act(async () => {
      expect(
        await result.current({
          ...options,
          onChunk: (chunk) => {
            text += chunk
          },
        }),
      ).toEqual({ ok: true })
    })
    expect(text).toBe('【方向】一步一步來')
  })

  it('returns quota errors without starting a reading', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(Response.json({ message: 'Daily limit' }, { status: 429 })),
    )
    const { result } = renderHook(() => useInterpretationStream())
    const onChunk = vi.fn()
    expect(await result.current({ ...options, onChunk })).toEqual({
      ok: false,
      error: 'Daily limit',
    })
    expect(onChunk).not.toHaveBeenCalled()
  })

  it('reports an interrupted stream after delivering the available text', async () => {
    let count = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          new ReadableStream({
            pull(controller) {
              if (count++ === 0) controller.enqueue(new TextEncoder().encode('已有內容'))
              else controller.error(new Error('offline'))
            },
          }),
        ),
      ),
    )
    const { result } = renderHook(() => useInterpretationStream())
    const onChunk = vi.fn()
    expect(await result.current({ ...options, onChunk })).toEqual({
      ok: false,
      error: 'Disconnected',
    })
    expect(onChunk).toHaveBeenCalledWith('已有內容')
  })

  it('cancels the request when leaving the page', async () => {
    let signal: AbortSignal | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            signal = init.signal
            signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            )
          }),
      ),
    )
    const { result, unmount } = renderHook(() => useInterpretationStream())
    const reading = result.current({ ...options, onChunk: vi.fn() })
    unmount()
    expect(signal?.aborted).toBe(true)
    expect(await reading).toEqual({ ok: false, aborted: true })
  })
})
