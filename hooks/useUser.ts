'use client'

import { useContext } from 'react'
import { AuthContext } from '@/components/AuthProvider'

export function useUser() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useUser must be used within AuthProvider')
  return context
}
