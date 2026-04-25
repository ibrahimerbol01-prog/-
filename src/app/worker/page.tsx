'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Application {
  id: string
  vacancy_id: string
  status: string
  created_at: string
  vacancies: {
    title: string
    description: string
    salary: string
    district?: string
    type?: string
    urgent?: boolean
    profiles: {
      full_name: string
      company_name?: string
    }
  }
}

export default function WorkerDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data } = await supabase
          .from('applications')
          .select(`
            *,
            vacancies (
              title,
              description,
              salary,
              district,
              type,
              urgent,
              profiles (
                full_name,
                company_name
              )
            )
          `)
          .eq('worker_id', session.user.id)
          .order('created_at', { ascending: false })

        setApplications(data || [])
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'approved': return 'bg-green-500/20 text-green-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает рассмотрения'
      case 'approved': return 'Одобрено'
      case 'rejected': return 'Отклонено'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-xl text-primary">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="h2-text text-primary">Мои отклики</h1>
          <Link href="/vacancies" className="btn-primary px-6">
            Смотреть вакансии
          </Link>
        </div>

        <div className="space-y-6">
          {applications.map(app => (
            <div key={app.id} className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        {app.vacancies?.title}
                      </h3>
                      <p className="text-secondary mb-2">
                        {app.vacancies?.profiles?.company_name || app.vacancies?.profiles?.full_name}
                      </p>
                      <p className="text-secondary text-sm mb-3">
                        {app.vacancies?.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {app.vacancies?.district && (
                          <span className="badge">{app.vacancies.district}</span>
                        )}
                        {app.vacancies?.type && (
                          <span className="badge">{app.vacancies.type}</span>
                        )}
                        {app.vacancies?.urgent && (
                          <span className="badge bg-red-500/20 text-red-400">Срочно</span>
                        )}
                      </div>
                      <p className="text-lg font-semibold text-green-400">
                        {app.vacancies?.salary}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`badge ${getStatusColor(app.status)}`}>
                        {getStatusText(app.status)}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-secondary">
                    Отклик отправлен: {new Date(app.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="h2-text text-primary mb-2">Нет откликов</h3>
              <p className="text-secondary mb-6">
                Вы еще не откликнулись ни на одну вакансию
              </p>
              <Link href="/vacancies" className="btn-primary px-8 py-3">
                Найти работу
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}