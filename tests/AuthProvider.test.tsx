import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/components/AuthProvider'
import { useUser } from '@/hooks/useUser'

const auth = vi.hoisted(() => ({
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
}))
vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: true,
  createClient: () => ({ auth }),
}))
vi.mock('@/components/AuthDialog', () => ({
  default: () => <div role="dialog">Sign in</div>,
}))

function Consumer({ children }: { children?: ReactNode }) {
  const { user, loading, openAuth } = useUser()
  return (
    <button onClick={openAuth}>
      {loading ? 'Loading' : (user?.id ?? 'Guest')}
      {children}
    </button>
  )
}

describe('shared authentication', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    auth.getUser.mockResolvedValue({ data: { user: null } })
    auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: auth.unsubscribe } },
    })
  })

  it('performs one initial lookup and one subscription for multiple consumers', async () => {
    const { unmount } = render(
      <AuthProvider>
        <Consumer />
        <Consumer />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getAllByText('Guest')).toHaveLength(2))
    expect(auth.getUser).toHaveBeenCalledTimes(1)
    expect(auth.onAuthStateChange).toHaveBeenCalledTimes(1)
    unmount()
    expect(auth.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('does not restore an old user after a newer sign-out event', async () => {
    let resolve: (value: { data: { user: Partial<User> } }) => void = () => {}
    auth.getUser.mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )
    act(() => auth.onAuthStateChange.mock.calls[0][0]('SIGNED_OUT', null))
    await act(async () => resolve({ data: { user: { id: 'old-user' } } }))
    expect(screen.getByText('Guest')).toBeInTheDocument()
  })
})
