'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ReadingHistoryItem from '@/components/ReadingHistoryItem'
import { Button } from '@/components/ui/button'
import { useReadings } from '@/hooks/useReadings'
import { useUser } from '@/hooks/useUser'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export default function HistoryPage() {
  const { user, loading, openAuth } = useUser()
  const common = useTranslations('common')
  const history = useTranslations('historyPage')
  const empty = !isSupabaseConfigured
    ? history('notConfigured')
    : loading
      ? common('loading')
      : !user
        ? history('needLogin')
        : null

  return (
    <main className="page-container py-10">
      {empty ? (
        <Empty text={empty}>
          {isSupabaseConfigured && !loading && !user && (
            <Button type="button" onClick={openAuth} variant="brand" className="mt-4">
              {common('login')}
            </Button>
          )}
          <Button asChild variant="link" className="mt-4">
            <Link href="/">{common('backHome')}</Link>
          </Button>
        </Empty>
      ) : (
        user && <MemberHistory key={user.id} userId={user.id} />
      )}
    </main>
  )
}

function MemberHistory({ userId }: { userId: string }) {
  const common = useTranslations('common')
  const history = useTranslations('historyPage')
  const { readings, loading, error, removingId, reload, remove } = useReadings(userId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl text-foreground">{history('title')}</h1>
        <Button asChild variant="link">
          <Link href="/">{history('askAgain')}</Link>
        </Button>
      </div>
      {error && (
        <div role="alert" className="mb-4 space-y-2 text-sm text-destructive">
          <p>{history(error === 'load' ? 'errLoad' : 'errRemove')}</p>
          {error === 'load' && (
            <Button type="button" variant="outline" onClick={reload}>
              {history('retry')}
            </Button>
          )}
        </div>
      )}
      {loading ? (
        <Empty text={common('loading')} />
      ) : !error && readings.length === 0 ? (
        <Empty text={history('empty')} />
      ) : (
        <ul className="space-y-3">
          {readings.map((reading) => (
            <ReadingHistoryItem
              key={reading.id}
              reading={reading}
              expanded={expandedId === reading.id}
              removing={removingId === reading.id}
              deleteDisabled={removingId !== null}
              onToggle={() =>
                setExpandedId(expandedId === reading.id ? null : reading.id)
              }
              onRemove={() => void remove(reading.id)}
            />
          ))}
        </ul>
      )}
    </>
  )
}

function Empty({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <p className="text-muted-foreground">{text}</p>
      {children}
    </div>
  )
}
