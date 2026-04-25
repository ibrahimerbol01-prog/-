'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { LoadingSpinner, EmptyState } from '@/components/LoadingStates'
import SaveJobButton from '@/components/SaveJobButton'

interface Vacancy {
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

interface RecommendedVacancy extends Vacancy {
  matchScore: number
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<RecommendedVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          window.location.href = '/auth/login'
          return
        }

        setUserId(session.user.id)

        // Get user profile with skills
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setUserProfile(profile)

        // Fetch all vacancies
        const { data: allVacancies } = await supabase
          .from('vacancies')
          .select(`
            *,
            profiles (
              full_name,
              company_name
            )
          `)
          .order('created_at', { ascending: false })

        if (!allVacancies) {
          setRecommendations([])
          return
        }

        // Calculate match scores based on skills and profile
        const scored = allVacancies.map(vacancy => {
          let score = 0

          // District bonus
          if (profile?.district && vacancy.district === profile.district) {
            score += 30
          }

          // Urgent bonus
          if (vacancy.urgent) {
            score += 10
          }

          // Experience requirement match
          if (vacancy.type === 'Полная занятость') {
            score += 20
          } else if (vacancy.type === 'Частичная занятость' && profile?.experience) {
            score += 15
          }

          // Salary preference (if available in profile)
          if (vacancy.salary.includes('000')) {
            score += 10
          }

          // Random factor for variety
          score += Math.random() * 15

          return { ...vacancy, matchScore: Math.round(score) }
        })

        // Sort by score and take top 8
        const topRecommendations = scored
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 8)

        setRecommendations(topRecommendations)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
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
          <h1 className="h2-text text-primary mb-2">Рекомендации для вас</h1>
          <p className="text-secondary">
            Вакансии подобраны на основе вашего профиля и опыта
          </p>
          {userProfile?.skills && userProfile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {userProfile.skills.slice(0, 3).map((skill: string) => (
                <span key={skill} className="badge">{skill}</span>
              ))}
              {userProfile.skills.length > 3 && (
                <span className="text-sm text-secondary">
                  +{userProfile.skills.length - 3} еще
                </span>
              )}
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <EmptyState
            title="Рекомендаций пока нет"
            description="Убедитесь, что ваш профиль заполнен правильно, и создаются новые вакансии"
            action={
              <Link href="/vacancies" className="btn-primary px-6 py-2 inline-block">
                Смотреть все вакансии →
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {recommendations.map(vacancy => (
              <div
                key={vacancy.id}
                className={`${
                  vacancy.urgent ? 'urgent-card' : ''
                } bg-card border border-border rounded-2xl p-6 hover:border-cyan-400/50 transition`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Company and Match Score */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-secondary">
                        {vacancy.profiles?.company_name || vacancy.profiles?.full_name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-cyan-400">{vacancy.matchScore}%</div>
                          <div className="text-xs text-secondary">Совпадение</div>
                        </div>
                        <SaveJobButton vacancyId={vacancy.id} userId={userId || undefined} />
                      </div>
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
