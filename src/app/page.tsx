'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AIAssistant from '@/components/AIAssistant'
import QuickApply from '@/components/QuickApply'
import SaveJobButton from '@/components/SaveJobButton'

interface Vacancy {
  id: string
  title: string
  description: string
  salary: string
  employers_id: string
  created_at: string
  urgent?: boolean
  district?: string
  type?: string
  profiles: {
    full_name: string
    company_name?: string
    role: string
  }
}

export default function Home() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null)
  const [showQuickApply, setShowQuickApply] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [stats, setStats] = useState({ vacancies: 0, workers: 0, districts: 34 })

  useEffect(() => {
    // Fetch user session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getSession()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vacancies
        const { data, count } = await supabase
          .from('vacancies')
          .select(`
            *,
            profiles (
              full_name,
              company_name,
              role
            )
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(6)

        setVacancies(data || [])

        // Fetch stats
        const { count: vacancyCount } = await supabase
          .from('vacancies')
          .select('id', { count: 'exact', head: true })

        const { count: workerCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'worker')

        setStats({
          vacancies: vacancyCount || 0,
          workers: workerCount || 0,
          districts: 34
        })

        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center animated-gradient overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="hero-text text-white mb-4">
            Работа в Актау —<br />
            <span className="text-cyan-400">найди за 5 минут</span>
          </h1>

          <p className="text-cyan-400 text-xl italic mb-12 font-light">
            Каспий не спит. Работа ждёт.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/vacancies" className="btn-primary px-8 py-4 text-lg">
              Я ищу работу →
            </Link>
            <Link href="/employers" className="btn-secondary px-8 py-4 text-lg">
              Я работодатель →
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.vacancies}</div>
              <div className="text-sm uppercase tracking-wide">Вакансий</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.workers}</div>
              <div className="text-sm uppercase tracking-wide">Соискателей</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.districts}</div>
              <div className="text-sm uppercase tracking-wide">Района</div>
            </div>
          </div>
        </div>

        {/* Subtle overlay pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Featured Vacancies Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="h2-text text-primary">Актуальные вакансии</h2>
            <Link href="/vacancies" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              Все вакансии →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-xl text-secondary">Загрузка...</div>
            </div>
          ) : vacancies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary">Вакансии будут добавлены вскоре</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacancies.map(vacancy => (
                <div
                  key={vacancy.id}
                  className={`card-hover ${vacancy.urgent ? 'urgent-card' : ''} bg-card border border-border rounded-2xl p-6 flex flex-col`}
                >
                  {/* Company Header with Save Button */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-secondary">
                      {vacancy.profiles?.company_name || vacancy.profiles?.full_name}
                    </div>
                    <SaveJobButton vacancyId={vacancy.id} userId={userId || undefined} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-2">
                    {vacancy.title}
                  </h3>

                  {/* Description */}
                  <p className="text-secondary mb-4 line-clamp-2 flex-grow">
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
                      <span className="badge bg-red-500/20 text-red-400 text-xs">Срочно</span>
                    )}
                  </div>

                  {/* Salary */}
                  <div className="text-lg font-semibold text-green-400 mb-4">
                    {vacancy.salary}
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => {
                      setSelectedVacancy(vacancy)
                      setShowQuickApply(true)
                    }}
                    className="w-full btn-primary text-center"
                  >
                    Откликнуться →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant Widget */}
      <AIAssistant />

      {/* Quick Apply Modal */}
      {selectedVacancy && (
        <QuickApply
          vacancy={selectedVacancy}
          isOpen={showQuickApply}
          onClose={() => {
            setShowQuickApply(false)
            setSelectedVacancy(null)
          }}
          onSuccess={() => {
            // Refresh vacancies if needed
            setVacancies(vacancies)
          }}
        />
      )}
    </div>
  );
}
