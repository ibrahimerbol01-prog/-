'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface QuickApplyProps {
  vacancy: {
    id: string
    title: string
    description: string
    salary: string
    district?: string
    type?: string
    profiles: {
      full_name: string
      company_name?: string
    }
  }
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function QuickApply({ vacancy, isOpen, onClose, onSuccess }: QuickApplyProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userSession, setUserSession] = useState<any>(null)

  // Check user session on mount
  useState(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserSession(session)
    }
    checkAuth()
  })

  const handleApply = async () => {
    if (!userSession) {
      setError('Пожалуйста, сначала войдите в систему'
      return
    }

    if (!message.trim()) {
      setError('Пожалуйста, напишите сообщение о себе')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          vacancy_id: vacancy.id,
          worker_id: userSession.user.id,
          message: message,
          status: 'pending'
        })

      if (insertError) throw insertError

      setSuccess(true)
      setMessage('')

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose()
        onSuccess?.()
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке заявки')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (!userSession) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border">
          <h2 className="text-xl font-semibold text-primary mb-4">Требуется вход</h2>
          <p className="text-secondary mb-6">
            Чтобы откликнуться на вакансию, пожалуйста, войдите в свой аккаунт.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-secondary hover:bg-primary/10"
            >
              Отмена
            </button>
            <Link
              href="/auth/login"
              className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 text-white text-center hover:bg-cyan-600"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border max-h-[90vh] overflow-y-auto">
        {/* Success State */}
        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-primary mb-2">Заявка отправлена!</h3>
            <p className="text-secondary">
              Работодатель рассмотрит вашу заявку. Мы уведомим вас об ответе.
            </p>
          </div>
        ) : (
          <>
            {/* Job Preview */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold text-primary mb-2">{vacancy.title}</h3>
              <p className="text-sm text-secondary mb-3">
                {vacancy.profiles?.company_name || vacancy.profiles?.full_name}
              </p>
              <p className="text-green-400 font-semibold mb-3">{vacancy.salary}</p>
              <p className="text-sm text-secondary line-clamp-3">{vacancy.description}</p>
            </div>

            {/* Message Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-2">
                Ваше сообщение
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Расскажите о себе и почему вас интересует эта должность..."
                className="w-full px-4 py-3 rounded-lg bg-primary border border-border text-primary placeholder-secondary resize-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                rows={4}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-secondary hover:bg-primary/10 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 transition"
              >
                {loading ? 'Отправляем...' : 'Откликнуться'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
