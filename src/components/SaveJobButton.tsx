'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface SaveJobButtonProps {
  vacancyId: string
  userId?: string
}

export default function SaveJobButton({ vacancyId, userId }: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    const checkSaved = async () => {
      const { data } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('vacancy_id', vacancyId)
        .eq('worker_id', userId)
        .single()

      setIsSaved(!!data)
    }

    checkSaved()
  }, [vacancyId, userId])

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) return

    setLoading(true)

    try {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('vacancy_id', vacancyId)
          .eq('worker_id', userId)

        if (error) throw error
        setIsSaved(false)
      } else {
        // Add to saved
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            vacancy_id: vacancyId,
            worker_id: userId
          })

        if (error) throw error
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving job:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading || !userId}
      className={`p-2 rounded-lg transition ${
        isSaved
          ? 'text-red-400 hover:text-red-500'
          : 'text-secondary hover:text-primary'
      } disabled:opacity-50`}
      title={isSaved ? 'Убрать из сохраненных' : 'Сохранить вакансию'}
    >
      <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )
}
