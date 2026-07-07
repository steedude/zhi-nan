'use client'

import type { AuthFormValues } from '@/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { authSchema } from '@/lib/validation/auth'

/** 登入 / 註冊對話框(Email + 密碼) */

interface Props {
  open: boolean
  onClose: () => void
}

type Mode = 'signin' | 'signup'

export default function AuthDialog({ open, onClose }: Props) {
  const t = useTranslations('auth')
  const [mode, setMode] = useState<Mode>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (!open) return null

  async function submit({ email, password }: AuthFormValues) {
    setError('')
    setNotice('')
    setLoading(true)

    const supabase = createClient()
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setError(t('errSignin'))
          return
        }
        onClose()
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) {
          setError(
            error.message.includes('already registered')
              ? t('errRegistered')
              : t('errSignup'),
          )
          return
        }
        // 專案若開啟「Confirm email」,註冊後不會直接取得 session
        if (data.session) {
          onClose()
        } else {
          setNotice(t('confirmSent'))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card animate-fade-up w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg text-stone-800">
            {mode === 'signin' ? t('signinTitle') : t('signupTitle')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="text-stone-400 transition hover:text-stone-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <input
            type="email"
            {...register('email')}
            placeholder={t('email')}
            className="input-field"
          />
          <input
            type="password"
            {...register('password')}
            placeholder={t('password')}
            className="input-field"
          />

          {(errors.email || errors.password) && (
            <p className="text-sm text-red-600">{t('errInvalid')}</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-emerald-600">{notice}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? t('processing') : mode === 'signin' ? t('signin') : t('signup')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          {mode === 'signin' ? t('noAccount') : t('hasAccount')}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setNotice('')
              reset()
            }}
            className="ml-1 text-teal-700 transition hover:text-teal-600"
          >
            {mode === 'signin' ? t('toSignup') : t('toSignin')}
          </button>
        </p>

        <p className="mt-3 text-center text-xs text-stone-400">{t('hint')}</p>
      </div>
    </div>
  )
}
