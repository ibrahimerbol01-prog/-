'use client'
 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
 
interface ProfileData {
  role: 'worker' | 'employers'
  full_name: string
  age: number
  iin: string
  phone: string
  skills: string[]
  experience: boolean
  experience_text: string
  bio: string
  desired_salary: string
  district: string
  portfolio_items: Array<{ title: string; description: string; link?: string }>
  company_name: string
  industry: string
  company_description: string
  contact_phone: string
}
 
export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    role: 'worker',
    full_name: '',
    age: 18,
    iin: '',
    phone: '',
    skills: [],
    experience: false,
    experience_text: '',
    bio: '',
    desired_salary: '',
    district: '',
    portfolio_items: [],
    company_name: '',
    industry: '',
    company_description: '',
    contact_phone: ''
  })
 
  // ── все хуки — до любого return ──────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
 
      if (profile && profile.full_name) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])
 
  // ── вспомогательные функции — тоже до return ─────────────────────────────
  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }
 
  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !profileData.skills.includes(trimmed)) {
      updateProfileData('skills', [...profileData.skills, trimmed])
    }
  }
 
  const removeSkill = (skill: string) => {
    updateProfileData('skills', profileData.skills.filter(s => s !== skill))
  }
 
  const addPortfolioItem = () => {
    updateProfileData('portfolio_items', [
      ...profileData.portfolio_items,
      { title: '', description: '', link: '' }
    ])
  }
 
  const updatePortfolioItem = (index: number, field: string, value: string) => {
    const newItems = [...profileData.portfolio_items]
    newItems[index] = { ...newItems[index], [field]: value }
    updateProfileData('portfolio_items', newItems)
  }
 
  const removePortfolioItem = (index: number) => {
    updateProfileData('portfolio_items', profileData.portfolio_items.filter((_, i) => i !== index))
  }
 
  const validateIIN = (iin: string) => /^\d{12}$/.test(iin)
 
  const totalSteps = profileData.role === 'worker' ? 5 : 4
 
  const nextStep = () => {
    if (currentStep === 2 && !validateIIN(profileData.iin)) {
      alert('ИИН должен содержать ровно 12 цифр')
      return
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }
 
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }
 
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
 
      const profile = {
        id: session.user.id,
        full_name: profileData.full_name,
        age: profileData.age,
        iin: profileData.iin,
        phone: profileData.phone,
        avatar_url: session.user.user_metadata?.avatar_url,
        role: profileData.role,
        skills: profileData.skills,
        experience: profileData.experience,
        experience_text: profileData.experience_text,
        bio: profileData.bio,
        desired_salary: profileData.desired_salary,
        district: profileData.district,
        portfolio_items: profileData.portfolio_items,
        ...(profileData.role === 'employers' && {
          company_name: profileData.company_name,
          industry: profileData.industry,
          company_description: profileData.company_description,
          contact_phone: profileData.contact_phone
        })
      }
 
      const { error } = await supabase.from('profiles').upsert(profile)
      if (error) throw error
      router.push('/')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Ошибка при сохранении профиля')
    } finally {
      setLoading(false)
    }
  }
 
  // ── единственный return ──────────────────────────────────────────────────
  const progress = (currentStep / totalSteps) * 100
 
  const isLastStep = currentStep === totalSteps
 
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
 
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="h2-text text-primary">Настройка профиля</h1>
            <span className="text-secondary">{currentStep} из {totalSteps}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-accent-caspian h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
 
        {/* Step Content */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
 
          {/* Step 1: Role Selection */}
          {currentStep === 1 && (
            <div className="text-center">
              <h2 className="h2-text text-primary mb-2">Кто вы?</h2>
              <p className="text-secondary mb-8">Выберите вашу роль в KASPY</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => { updateProfileData('role', 'worker'); nextStep() }}
                  className="card-hover bg-card border border-border rounded-2xl p-8 text-left transition-all"
                >
                  <div className="text-6xl mb-4">👷</div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Ищу работу</h3>
                  <p className="text-secondary">Найду подходящую вакансию в Актау</p>
                </button>
                <button
                  onClick={() => { updateProfileData('role', 'employers'); nextStep() }}
                  className="card-hover bg-card border border-border rounded-2xl p-8 text-left transition-all"
                >
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Ищу сотрудников</h3>
                  <p className="text-secondary">Опубликую вакансию и найду кандидатов</p>
                </button>
              </div>
            </div>
          )}
 
          {/* Step 2: Basic Info */}
          {currentStep === 2 && (
            <div>
              <h2 className="h2-text text-primary mb-6">Основная информация</h2>
              <div className="space-y-6">
                <div>
                  <label className="block label-text mb-2">Имя и Фамилия</label>
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) => updateProfileData('full_name', e.target.value)}
                    className="w-full input-field"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block label-text mb-2">Возраст</label>
                    <input
                      type="number"
                      value={profileData.age}
                      onChange={(e) => updateProfileData('age', parseInt(e.target.value))}
                      className="w-full input-field"
                      min="16"
                      max="70"
                    />
                  </div>
                  <div>
                    <label className="block label-text mb-2">ИИН</label>
                    <input
                      type="text"
                      value={profileData.iin}
                      onChange={(e) => updateProfileData('iin', e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="w-full input-field"
                      placeholder="123456789012"
                      maxLength={12}
                    />
                    <p className="text-xs text-secondary mt-1">12 цифр, нужен для верификации</p>
                  </div>
                </div>
                <div>
                  <label className="block label-text mb-2">Номер телефона</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => updateProfileData('phone', e.target.value)}
                    className="w-full input-field"
                    placeholder="+7 777 123 45 67"
                  />
                </div>
              </div>
            </div>
          )}
 
          {/* Step 3: Worker Profile */}
          {currentStep === 3 && profileData.role === 'worker' && (
            <div>
              <h2 className="h2-text text-primary mb-6">Ваш профиль</h2>
              <div className="space-y-6">
                <div>
                  <label className="block label-text mb-2">Навыки</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileData.skills.map(skill => (
                      <span key={skill} className="badge flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-red-400 hover:text-red-300">×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Добавьте навык и нажмите Enter"
                    className="w-full input-field"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addSkill((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['сварка', 'электрик', 'повар', 'водитель', 'кассир', 'грузчик', 'уборщик', 'охранник', 'курьер'].map(skill => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="badge hover:bg-white/20 transition-colors"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
 
                <div>
                  <label className="block label-text mb-2">Опыт работы</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="experience"
                          checked={!profileData.experience}
                          onChange={() => updateProfileData('experience', false)}
                        />
                        <span className="text-primary">Нет опыта</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="experience"
                          checked={profileData.experience}
                          onChange={() => updateProfileData('experience', true)}
                        />
                        <span className="text-primary">Есть опыт</span>
                      </label>
                    </div>
                    {profileData.experience && (
                      <textarea
                        value={profileData.experience_text}
                        onChange={(e) => updateProfileData('experience_text', e.target.value)}
                        className="w-full input-field h-24"
                        placeholder="Расскажите об опыте (где работал, сколько лет)..."
                      />
                    )}
                  </div>
                </div>
 
                <div>
                  <label className="block label-text mb-2">О себе</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => updateProfileData('bio', e.target.value)}
                    className="w-full input-field h-24"
                    placeholder="Пару слов о себе..."
                  />
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block label-text mb-2">Желаемая зарплата</label>
                    <input
                      type="text"
                      value={profileData.desired_salary}
                      onChange={(e) => updateProfileData('desired_salary', e.target.value)}
                      className="w-full input-field"
                      placeholder="150 000 ₸"
                    />
                  </div>
                  <div>
                    <label className="block label-text mb-2">Микрорайон</label>
                    <select
                      value={profileData.district}
                      onChange={(e) => updateProfileData('district', e.target.value)}
                      className="w-full input-field"
                    >
                      <option value="">Выберите район</option>
                      {Array.from({ length: 34 }, (_, i) => (
                        <option key={i + 1} value={`${i + 1} мкр`}>{i + 1} мкр</option>
                      ))}
                      <option value="Центр">Центр</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
 
          {/* Step 3: Employers Profile */}
          {currentStep === 3 && profileData.role === 'employers' && (
            <div>
              <h2 className="h2-text text-primary mb-6">О компании</h2>
              <div className="space-y-6">
                <div>
                  <label className="block label-text mb-2">Название компании</label>
                  <input
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) => updateProfileData('company_name', e.target.value)}
                    className="w-full input-field"
                    placeholder="ООО 'Пример'"
                  />
                </div>
                <div>
                  <label className="block label-text mb-2">Сфера деятельности</label>
                  <input
                    type="text"
                    value={profileData.industry}
                    onChange={(e) => updateProfileData('industry', e.target.value)}
                    className="w-full input-field"
                    placeholder="Строительство, IT, Торговля..."
                  />
                </div>
                <div>
                  <label className="block label-text mb-2">О компании</label>
                  <textarea
                    value={profileData.company_description}
                    onChange={(e) => updateProfileData('company_description', e.target.value)}
                    className="w-full input-field h-24"
                    placeholder="Расскажите о вашей компании..."
                  />
                </div>
                <div>
                  <label className="block label-text mb-2">Контактный телефон</label>
                  <input
                    type="tel"
                    value={profileData.contact_phone}
                    onChange={(e) => updateProfileData('contact_phone', e.target.value)}
                    className="w-full input-field"
                    placeholder="+7 777 123 45 67"
                  />
                </div>
              </div>
            </div>
          )}
 
          {/* Step 4: Worker Portfolio */}
          {currentStep === 4 && profileData.role === 'worker' && (
            <div>
              <h2 className="h2-text text-primary mb-2">Портфолио</h2>
              <p className="text-secondary mb-6">Покажите свои работы (необязательно)</p>
              <div className="space-y-4">
                {profileData.portfolio_items.map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-primary">Проект {index + 1}</h4>
                      <button
                        onClick={() => removePortfolioItem(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Удалить
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                        className="w-full input-field"
                        placeholder="Название проекта"
                      />
                      <textarea
                        value={item.description}
                        onChange={(e) => updatePortfolioItem(index, 'description', e.target.value)}
                        className="w-full input-field h-20"
                        placeholder="Описание проекта"
                      />
                      <input
                        type="url"
                        value={item.link || ''}
                        onChange={(e) => updatePortfolioItem(index, 'link', e.target.value)}
                        className="w-full input-field"
                        placeholder="Ссылка на проект (необязательно)"
                      />
                    </div>
                  </div>
                ))}
                {profileData.portfolio_items.length < 5 && (
                  <button onClick={addPortfolioItem} className="w-full btn-secondary py-3">
                    + Добавить проект
                  </button>
                )}
              </div>
            </div>
          )}
 
          {/* Last Step: Success */}
          {isLastStep && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="h2-text text-primary mb-2">Готово!</h2>
              <p className="text-secondary mb-8">Ваш профиль настроен и готов к работе</p>
              <div className="bg-white/5 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-primary mb-4">Ваш профиль</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-secondary">Имя:</span> {profileData.full_name}</p>
                  <p><span className="text-secondary">Роль:</span> {profileData.role === 'worker' ? 'Соискатель' : 'Работодатель'}</p>
                  {profileData.role === 'worker' && (
                    <>
                      <p><span className="text-secondary">Навыки:</span> {profileData.skills.join(', ') || 'Не указаны'}</p>
                      <p><span className="text-secondary">Район:</span> {profileData.district || 'Не указан'}</p>
                    </>
                  )}
                  {profileData.role === 'employers' && (
                    <p><span className="text-secondary">Компания:</span> {profileData.company_name}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
 
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button onClick={prevStep} className="btn-secondary px-6">
              Назад
            </button>
          )}
          <div className="flex-1" />
          {!isLastStep ? (
            <button onClick={nextStep} className="btn-primary px-6">
              Далее
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary px-6 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Завершить'}
            </button>
          )}
        </div>
 
      </div>
    </div>
  )
}