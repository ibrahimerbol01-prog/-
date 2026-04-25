'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useContactActions, PhoneModal } from '@/lib/contactActions'

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
}

interface Application {
  id: string
  vacancy_id: string
  worker_id: string
  status: string
  created_at: string
  profiles: {
    full_name: string
    skills: string[]
    bio: string
    experience: boolean
    experience_text: string
    phone: string
  }
}

export default function EmployersDashboard() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    urgent: false,
    district: '',
    type: 'Полная занятость'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Fetch employers's vacancies
      const { data: vacData } = await supabase
        .from('vacancies')
        .select('*')
        .eq('employers_id', session.user.id)
        .order('created_at', { ascending: false })

      setVacancies(vacData || [])

      // Fetch applications for these vacancies
      if (vacData && vacData.length > 0) {
        const vacancyIds = vacData.map(v => v.id)
        const { data: appData } = await supabase
          .from('applications')
          .select(`
            *,
            profiles:worker_id (
              full_name,
              skills,
              bio,
              experience,
              experience_text,
              phone
            )
          `)
          .in('vacancy_id', vacancyIds)
          .order('created_at', { ascending: false })

        setApplications(appData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('vacancies')
        .insert({
          title: formData.title,
          description: formData.description,
          salary: formData.salary,
          employers_id: session.user.id,
          urgent: formData.urgent,
          district: formData.district,
          type: formData.type
        })

      if (error) throw error

      setFormData({
        title: '',
        description: '',
        salary: '',
        urgent: false,
        district: '',
        type: 'Полная занятость'
      })
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Error creating vacancy:', error)
      alert('Ошибка при создании вакансии')
    } finally {
      setLoading(false)
    }
  }

  const districts = [
    'Центр', '1 мкр', '2 мкр', '3 мкр', '4 мкр', '5 мкр', '6 мкр', '7 мкр', '8 мкр', '9 мкр',
    '10 мкр', '11 мкр', '12 мкр', '13 мкр', '14 мкр', '15 мкр', '16 мкр', '17 мкр', '18 мкр', '19 мкр',
    '20 мкр', '21 мкр', '22 мкр', '23 мкр', '24 мкр', '25 мкр', '26 мкр', '27 мкр', '28 мкр', '29 мкр',
    '30 мкр', '31 мкр', '32 мкр', '33 мкр', '34 мкр'
  ]

  const jobTypes = ['Полная занятость', 'Частичная занятость', 'Вахта', 'Удаленная работа']

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-xl text-primary">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="h2-text text-primary">Мои вакансии</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary px-6"
          >
            {showForm ? 'Отмена' : '+ Создать вакансию'}
          </button>
        </div>

        {/* Create Vacancy Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-2xl">
            <h2 className="h2-text text-primary mb-6">Новая вакансия</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block label-text mb-2">Название вакансии</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full input-field"
                    placeholder="Водитель на Газель"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block label-text mb-2">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full input-field h-24"
                    placeholder="Опишите требования и обязанности..."
                    required
                  />
                </div>

                <div>
                  <label className="block label-text mb-2">Зарплата</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="w-full input-field"
                    placeholder="150 000 ₸"
                    required
                  />
                </div>

                <div>
                  <label className="block label-text mb-2">Район</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full input-field"
                  >
                    <option value="">Все районы</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block label-text mb-2">Тип работы</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full input-field"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <label htmlFor="urgent" className="text-primary">Срочная вакансия</label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary px-6"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-6 disabled:opacity-50"
                >
                  {loading ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vacancies and Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vacancies */}
          <div>
            <h2 className="h2-text text-primary mb-6">Вакансии ({vacancies.length})</h2>
            <div className="space-y-4">
              {vacancies.map(vacancy => (
                <div key={vacancy.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-2">{vacancy.title}</h3>
                      <p className="text-secondary text-sm mb-2">{vacancy.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {vacancy.district && <span className="badge">{vacancy.district}</span>}
                        {vacancy.type && <span className="badge">{vacancy.type}</span>}
                        {vacancy.urgent && <span className="badge bg-red-500/20 text-red-400">Срочно</span>}
                      </div>
                      <p className="text-lg font-semibold text-green-400">{vacancy.salary}</p>
                    </div>
                  </div>
                  <p className="text-xs text-secondary">
                    {new Date(vacancy.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              ))}

              {vacancies.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-secondary">У вас пока нет вакансий</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary mt-4"
                  >
                    Создать первую вакансию
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Applications */}
          <div>
            <h2 className="h2-text text-primary mb-6">Отклики ({applications.length})</h2>
            <div className="space-y-4">
              {applications.map(app => {
                // Get vacancy title for this application
                const vacancy = vacancies.find(v => v.id === app.vacancy_id)
                const contactActions = useContactActions({
                  applicantName: app.profiles?.full_name || 'Соискатель',
                  applicantPhone: app.profiles?.phone || '',
                  jobTitle: vacancy?.title || 'вакансию'
                })

                return (
                <div key={app.id} className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">
                        {app.profiles?.full_name}
                      </h3>
                      <p className="text-secondary text-sm mb-2">{app.profiles?.bio}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {app.profiles?.skills?.map(skill => (
                          <span key={skill} className="badge">{skill}</span>
                        ))}
                      </div>
                      {app.profiles?.experience && (
                        <p className="text-sm text-secondary">
                          Опыт: {app.profiles.experience_text}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`badge ${
                      app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {app.status === 'pending' ? 'Ожидает' :
                       app.status === 'approved' ? 'Одобрен' : 'Отклонен'}
                    </span>

                    <div className="flex space-x-2">
                      <button 
                        onClick={contactActions.handleWhatsApp}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        WhatsApp
                      </button>
                      <button 
                        onClick={contactActions.handlePhone}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        Позвонить
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-secondary mt-2">
                    {new Date(app.created_at).toLocaleDateString('ru-RU')}
                  </p>

                  <PhoneModal
                    isOpen={contactActions.showPhoneModal}
                    phone={app.profiles?.phone}
                    applicantName={app.profiles?.full_name}
                    onClose={() => contactActions.setShowPhoneModal(false)}
                    onDial={contactActions.handleDial}
                    onCopy={contactActions.handleCopyPhone}
                  />
                </div>
                )
              })}

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-secondary">Пока нет откликов</p>
                  <p className="text-sm text-secondary mt-2">
                    Отклики появятся здесь, когда соискатели заинтересуются вашими вакансиями
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}