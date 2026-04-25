'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      {/* Urgent Ticker */}
      <div className="bg-red-500 h-10 flex items-center overflow-hidden">
        <div className="marquee whitespace-nowrap text-white text-sm font-medium px-4">
          🔴 СРОЧНО · Водитель на Газель · 9 мкр · через 2ч · 80 000 ₸ · 🔴 СРОЧНО · Кассир в супермаркет · Центр · через 4ч · 120 000 ₸ · 🔴 СРОЧНО · Электрик · 14 мкр · через 6ч · 150 000 ₸
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 frosted-glass border-b border-white/10">
        
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              <span className="text-cyan-400">K</span>ASPY
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/vacancies" className="text-white/80 hover:text-white transition-colors">
                Вакансии
              </Link>
              <Link href="/employers" className="text-white/80 hover:text-white transition-colors">
                Работодателям
              </Link>
              
               

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User Menu or Login */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
                      )}
                    </div>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <Link href="/profile" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                      Профиль
                    </Link>
                    <Link href={profile?.role === 'employers' ? '/employers' : '/worker'} className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                      {profile?.role === 'employers' ? 'Мои вакансии' : 'Мои отклики'}
                    </Link>
                    {profile?.role === 'worker' && (
                      <Link href="/worker/saved" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                        Сохраненные
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/auth/login" className="btn-primary px-6">
                  Войти
                </Link>
              )}

              {/* Post Job Button */}
              <Link href="/employers" className="hidden md:block btn-primary px-6">
                Разместить вакансию
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4">
              <div className="space-y-2">
                <Link href="/vacancies" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  Вакансии
                </Link>
                <Link href="/employers" className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  Работодателям
                </Link>
                <Link href="/employers" className="block mx-4 mt-4 btn-primary text-center">
                  Разместить вакансию
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}