'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { LoadingSpinner, EmptyState } from '@/components/LoadingStates'
import SaveJobButton from '@/components/SaveJobButton'

interface SavedVacancy {
  id: string
  title: string
  description: string
  salary: string
  district?: string
  type?: string
  urgent?: boolean
  created_at: string
  profiles: {
    full_name: string
    company_name?: string
  }
}

export default function SavedJobsPage() {
  const [vacancies, setVacancies] = useState<SavedVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedJobs = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          window.location.href = '/auth/login'
          return
        }

        setUserId(session.user.id)

        const { data } = await supabase
          .from('saved_jobs')
          .select(`
            vacancy_id,
            vacancies (
              id,
              title,
              description,
              salary,
              district,
              type,
              urgent,
              created_at,
              profiles (
                full_name,
                company_name
              )
            )
          `)
          .eq('worker_id', session.user.id)
          .order('created_at', { ascending: false })

        // Flatten the data structure
        const flattenedVacancies = data?.map(item => ({
          ...item.vacancies,
          profiles: item.vacancies.profiles
        })) || []

        setVacancies(flattenedVacancies)
      } catch (error) {
        console.error('Error fetching saved jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedJobs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="h2-text text-primary mb-2">Сохраненные вакансии</h1>
          <p className="text-secondary">
            {vacancies.length} {vacancies.length === 1 ? 'вакансия' : 'вакансий'}
          </p>
        </div>

        {vacancies.length === 0 ? (
          <EmptyState
            title="Нет сохраненных вакансий"
            description="Начните сохранять вакансии, которые вас интересуют"
            action={
              <Link href="/vacancies" className="btn-primary px-6 py-2 inline-block">
                Смотреть вакансии →
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {vacancies.map(vacancy => (
              <div
                key={vacancy.id}
                className={`${
                  vacancy.urgent ? 'urgent-card' : ''
                } bg-card border border-border rounded-2xl p-6 hover:border-cyan-400/50 transition`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Company */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-secondary">
                        {vacancy.profiles?.company_name || vacancy.profiles?.full_name}
                      </div>
                      <SaveJobButton vacancyId={vacancy.id} userId={userId || undefined} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      {vacancy.title}
                    </h3>

                    {/* Description */}
                    <p className="text-secondary mb-4 line-clamp-2">
                      {vacancy.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vacancy.district && (
                        <span className="badge text-xs">{vacancy.district}</span>
                      )}
                      {vacancy.type && (
                        <span className="badge text-xs">{vacancy.type}</span>
                      )}
                      {vacancy.urgent && (
                        <span className="badge bg-red-500/20 text-red-400 text-xs">
                          Срочно
                        </span>
                      )}
                    </div>

                    {/* Salary */}
                    <div className="text-lg font-semibold text-green-400">
                      {vacancy.salary}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="lg:w-48">
                    <Link
                      href="/vacancies"
                      className="w-full btn-primary text-center block"
                    >
                      Откликнуться →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
