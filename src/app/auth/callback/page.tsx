'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single()

        if (!profile || !profile.full_name) {
          router.push('/auth/onboarding')
        } else {
          router.push('/')
        }
      } else {
        router.push('/auth/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">Обработка входа...</p>
      </div>
    </div>
  )
}