'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { LoadingSpinner, EmptyState } from '@/components/LoadingStates'
import { useContactActions, PhoneModal } from '@/lib/contactActions'

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

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
        <LoadingSpinner />
      </div>
    )
  }

  // Filter applications by status
  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus)

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="h2-text text-primary">Мои отклики</h1>
          <div className="flex gap-3">
            <Link href="/worker/recommendations" className="btn-secondary px-4 py-2 text-sm">
              💡 Рекомендации
            </Link>
            <Link href="/vacancies" className="btn-primary px-4 py-2 text-sm">
              Смотреть вакансии
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                filterStatus === status
                  ? 'btn-primary'
                  : 'bg-card border border-border text-secondary hover:bg-primary/50'
              }`}
            >
              {status === 'all' && 'Все'}
              {status === 'pending' && '⏳ Рассмотрение'}
              {status === 'approved' && '✅ Одобрено'}
              {status === 'rejected' && '❌ Отклонено'}
              {status !== 'all' && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                  {applications.filter(a => a.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredApplications.map(app => {
            const contactActions = useContactActions({
              applicantName: app.vacancies?.profiles?.company_name || 'Компания',
              applicantPhone: '+ 7', // Placeholder - would need profile data
              jobTitle: app.vacancies?.title || 'вакансию'
            })

            return (
            <div key={app.id} className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:border-cyan-400/50 transition">
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

                  {/* Contact Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={contactActions.handleWhatsApp}
                      className="btn-primary text-sm px-3 py-2"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={contactActions.handlePhone}
                      className="btn-secondary text-sm px-3 py-2"
                    >
                      📞 Позвонить
                    </button>
                  </div>

                  <PhoneModal
                    isOpen={contactActions.showPhoneModal}
                    phone="+7 (XXX) XXX-XXXX"
                    applicantName={app.vacancies?.profiles?.company_name || 'Компания'}
                    onClose={() => contactActions.setShowPhoneModal(false)}
                    onDial={contactActions.handleDial}
                    onCopy={contactActions.handleCopyPhone}
                  />
                </div>
              </div>
            </div>
            )
          })}

          {filteredApplications.length === 0 && (
            <EmptyState
              title={filterStatus === 'all' ? 'Нет откликов' : 'Нет откликов с этим статусом'}
              description={filterStatus === 'all'
                ? 'Вы еще не откликнулись ни на одну вакансию'
                : 'Попробуйте другой фильтр'}
              action={
                <Link href="/vacancies" className="btn-primary px-8 py-3 inline-block">
                  Найти работу
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}