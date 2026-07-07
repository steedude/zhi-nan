'use client'

import type { AuthFormValues } from '@/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { authSchema } from '@/lib/validation/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

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
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent aria-label={t('close')}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? t('signinTitle') : t('signupTitle')}
          </DialogTitle>
          <DialogDescription>{t('hint')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <Input
            type="email"
            {...register('email')}
            placeholder={t('email')}
            aria-invalid={!!errors.email}
          />
          <Input
            type="password"
            {...register('password')}
            placeholder={t('password')}
            aria-invalid={!!errors.password}
          />

          {(errors.email || errors.password) && (
            <p className="text-sm text-red-600">{t('errInvalid')}</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-emerald-600">{notice}</p>}

          <Button type="submit" disabled={loading} variant="brand" className="w-full">
            {loading ? t('processing') : mode === 'signin' ? t('signin') : t('signup')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-stone-500">
          {mode === 'signin' ? t('noAccount') : t('hasAccount')}
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
              setNotice('')
              reset()
            }}
            className="ml-1 h-auto p-0 text-teal-700 hover:text-teal-600"
          >
            {mode === 'signin' ? t('toSignup') : t('toSignin')}
          </Button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
