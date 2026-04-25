import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sgswhrxjsedhlzvpsxhh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnc3docnhqc2VkaGx6dnBzeGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzMxODUsImV4cCI6MjA5MjU0OTE4NX0.ZMgbJeCsuKVJigFd4WPIhAcJKczgoCvpOI1q1P82g-Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// Найди функцию, которая отвечает за вход (например, handleLogin)
