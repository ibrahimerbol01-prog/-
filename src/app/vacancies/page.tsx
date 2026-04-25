'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Vacancy {
  id: string
  title: string
  description: string
  salary: string
  employer_id: string
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

interface User {
  id: string
  role?: string
}

export default function VacanciesPage() {
  const router = useRouter()
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [filteredVacancies, setFilteredVacancies] = useState<Vacancy[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    district: '',
    type: '',
    urgent: false,
    noExperience: false,
    salaryRange: [0, 500000]
  })

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setUser({ id: session.user.id, role: profile?.role })
      }

      // Fetch vacancies with employer info
      const { data } = await supabase
        .from('vacancies')
        .select(`
          *,
          profiles (
            full_name,
            company_name,
            role
          )
        `)
        .order('created_at', { ascending: false })

      setVacancies(data || [])
      setFilteredVacancies(data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...vacancies]

    if (filters.district) {
      filtered = filtered.filter(v => v.district?.toLowerCase().includes(filters.district.toLowerCase()))
    }

    if (filters.type) {
      filtered = filtered.filter(v => v.type?.toLowerCase().includes(filters.type.toLowerCase()))
    }

    if (filters.urgent) {
      filtered = filtered.filter(v => v.urgent)
    }

    if (filters.noExperience) {
      filtered = filtered.filter(v => !v.description?.toLowerCase().includes('опыт'))
    }

    // Salary range filter
    filtered = filtered.filter(v => {
      const salary = parseInt(v.salary.replace(/\D/g, '')) || 0
      return salary >= filters.salaryRange[0] && salary <= filters.salaryRange[1]
    })

    setFilteredVacancies(filtered)
  }, [filters, vacancies])

  const handleApply = async (vacancyId: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('vacancy_id', vacancyId)
      .eq('worker_id', user.id)
      .single()

    if (existing) {
      alert('Вы уже откликнулись на эту вакансию')
      return
    }

    // Apply
    const { error } = await supabase
      .from('applications')
      .insert({
        vacancy_id: vacancyId,
        worker_id: user.id,
        status: 'pending'
      })

    if (error) {
      console.error(error)
      alert('Ошибка при отклике')
    } else {
      alert('Отклик отправлен! Работодатель увидит твой профиль.')
    }
  }

  const districts = [
    'Центр', '1 мкр', '2 мкр', '3 мкр', '4 мкр', '5 мкр', '6 мкр', '7 мкр', '8 мкр', '9 мкр',
    '10 мкр', '11 мкр', '12 мкр', '13 мкр', '14 мкр', '15 мкр', '16 мкр', '17 мкр', '18 мкр', '19 мкр',
    '20 мкр', '21 мкр', '22 мкр', '23 мкр', '24 мкр', '25 мкр', '26 мкр', '27 мкр', '28 мкр', '29 мкр',
    '30 мкр', '31 мкр', '32 мкр', '33 мкр', '34 мкр'
  ]

  const jobTypes = ['Полная занятость', 'Частичная занятость', 'Вахта', 'Удаленная работа']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-primary">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="glass-card p-6 rounded-2xl sticky top-24">
              <h2 className="h2-text text-white mb-6">Фильтры</h2>

              <div className="space-y-6">
                {/* District */}
                <div>
                  <label className="block label-text mb-2">Район</label>
                  <select
                    value={filters.district}
                    onChange={(e) => setFilters({...filters, district: e.target.value})}
                    className="w-full input-field"
                  >
                    <option value="">Все районы</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block label-text mb-2">Тип работы</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full input-field"
                  >
                    <option value="">Все типы</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Urgent Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={filters.urgent}
                    onChange={(e) => setFilters({...filters, urgent: e.target.checked})}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <label htmlFor="urgent" className="text-sm text-primary">Срочные вакансии</label>
                </div>

                {/* No Experience Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="noExperience"
                    checked={filters.noExperience}
                    onChange={(e) => setFilters({...filters, noExperience: e.target.checked})}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <label htmlFor="noExperience" className="text-sm text-primary">Без опыта работы</label>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block label-text mb-2">Зарплата (₸)</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10000"
                      value={filters.salaryRange[1]}
                      onChange={(e) => setFilters({...filters, salaryRange: [0, parseInt(e.target.value)]})}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-secondary">
                      <span>0 ₸</span>
                      <span>{filters.salaryRange[1].toLocaleString()} ₸</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vacancies Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h1 className="h2-text text-primary">Вакансии</h1>
              <div className="text-sm text-secondary">
                Найдено: {filteredVacancies.length}
              </div>
            </div>

            <div className="grid gap-6">
              {filteredVacancies.map(vacancy => (
                <div
                  key={vacancy.id}
                  className={`card-hover ${vacancy.urgent ? 'urgent-card' : ''} bg-card border border-border rounded-2xl p-6`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* Company */}
                      <div className="text-sm text-secondary mb-2">
                        {vacancy.profiles?.company_name || vacancy.profiles?.full_name}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-primary mb-2">
                        {vacancy.title}
                      </h3>

                      {/* Description */}
                      <p className="text-secondary mb-3 line-clamp-2">
                        {vacancy.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {vacancy.district && (
                          <span className="badge">{vacancy.district}</span>
                        )}
                        {vacancy.type && (
                          <span className="badge">{vacancy.type}</span>
                        )}
                        {vacancy.urgent && (
                          <span className="badge bg-red-500/20 text-red-400">Срочно</span>
                        )}
                      </div>

                      {/* Salary */}
                      <div className="text-lg font-semibold text-green-400">
                        {vacancy.salary}
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="lg:w-48">
                      {user?.role === 'worker' ? (
                        <button
                          onClick={() => handleApply(vacancy.id)}
                          className="w-full btn-primary"
                        >
                          Откликнуться
                        </button>
                      ) : user?.role === 'employer' ? (
                        <div className="text-sm text-secondary">
                          Только для соискателей
                        </div>
                      ) : (
                        <Link href="/auth/login" className="w-full btn-primary block text-center">
                          Войти чтобы откликнуться
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredVacancies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-secondary">Вакансий не найдено</p>
                  <p className="text-sm text-secondary mt-2">Попробуйте изменить фильтры</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}