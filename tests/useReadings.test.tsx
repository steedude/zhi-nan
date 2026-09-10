import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useReadings } from '@/hooks/useReadings'

const { load, remove } = vi.hoisted(() => ({ load: vi.fn(), remove: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ limit: load }) }) }),
      delete: () => ({ eq: () => ({ eq: () => ({ select: remove }) }) }),
    }),
  }),
}))

describe('reading history', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    load.mockResolvedValue({ data: [{ id: 'reading-1' }], error: null })
  })

  it('keeps the reading visible when deletion fails and permits retry', async () => {
    remove
      .mockResolvedValueOnce({ error: new Error('offline') })
      .mockResolvedValueOnce({ data: [{ id: 'reading-1' }], error: null })
    const { result } = renderHook(() => useReadings('user-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.remove('reading-1'))
    expect(result.current.readings).toHaveLength(1)
    expect(result.current.error).toBe('remove')
    await act(() => result.current.remove('reading-1'))
    expect(result.current.readings).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('does not report a zero-row deletion as success', async () => {
    remove.mockResolvedValue({ data: [], error: null })
    const { result } = renderHook(() => useReadings('user-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.remove('reading-1'))
    expect(result.current.readings).toHaveLength(1)
    expect(result.current.error).toBe('remove')
  })

  it('distinguishes load failure from an empty history and recovers on retry', async () => {
    load.mockResolvedValueOnce({ data: null, error: new Error('offline') })
    const { result } = renderHook(() => useReadings('user-1'))
    await waitFor(() => expect(result.current.error).toBe('load'))
    expect(result.current.loading).toBe(false)
    await act(() => result.current.reload())
    expect(result.current.error).toBeNull()
    expect(result.current.readings).toHaveLength(1)
  })
})
