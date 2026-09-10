'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { ApiErrorBody } from '@/lib/errors'
import type { InterpretPayload } from '@/types/reading'

interface StartInterpretationOptions {
  payload: InterpretPayload
  onChunk: (chunk: string) => void
  fallbackError: string
  networkError: string
}

type StreamResult = { ok: true } | { ok: false; error?: string; aborted?: boolean }

/** 讀取串流；離開頁面或開始新請求時取消舊請求。 */
export function useInterpretationStream() {
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  return useCallback(
    async ({
      payload,
      onChunk,
      fallbackError,
      networkError,
    }: StartInterpretationOptions): Promise<StreamResult> => {
      controller.current?.abort()
      const request = new AbortController()
      controller.current = request
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
      try {
        const response = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: request.signal,
        })
        if (!response.ok || !response.body) {
          const data = await readApiError(response)
          return { ok: false, error: data?.message ?? data?.error ?? fallbackError }
        }

        reader = response.body.getReader()
        const decoder = new TextDecoder()
        for (;;) {
          const { done, value } = await reader.read()
          if (request.signal.aborted) return { ok: false, aborted: true }
          if (done) break
          onChunk(decoder.decode(value, { stream: true }))
        }
        const remaining = decoder.decode()
        if (remaining) onChunk(remaining)
        return { ok: true }
      } catch {
        return request.signal.aborted
          ? { ok: false, aborted: true }
          : { ok: false, error: networkError }
      } finally {
        reader?.releaseLock()
        if (controller.current === request) controller.current = null
      }
    },
    [],
  )
}

async function readApiError(response: Response): Promise<ApiErrorBody | null> {
  try {
    return (await response.json()) as ApiErrorBody
  } catch {
    return null
  }
}
