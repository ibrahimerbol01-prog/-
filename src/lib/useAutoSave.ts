'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface UseAutoSaveProps {
  data: any
  tableName: string
  userId: string
  debounceMs?: number
}

export function useAutoSave({ data, tableName, userId, debounceMs = 1000 }: UseAutoSaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<any>(null)

  useEffect(() => {
    // Check if data has changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from(tableName)
          .update(data)
          .eq('id', userId)

        if (error) {
          console.error('Autosave error:', error)
        } else {
          lastSavedRef.current = data
          // Show brief toast notification
          const event = new CustomEvent('autosave-success')
          window.dispatchEvent(event)
        }
      } catch (error) {
        console.error('Autosave failed:', error)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, tableName, userId, debounceMs])
}

export function AutoSaveToast() {
  const [show, setShow] = useEffect(false)

  useEffect(() => {
    const handleAutoSave = () => {
      setShow(true)
      setTimeout(() => setShow(false), 2000)
    }

    window.addEventListener('autosave-success', handleAutoSave)
    return () => window.removeEventListener('autosave-success', handleAutoSave)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-3 rounded-lg text-sm animate-fade-in">
      ✓ Изменения сохранены
    </div>
  )
}
