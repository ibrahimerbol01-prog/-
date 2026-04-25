'use client'

export function VacancyCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
      <div className="h-4 bg-primary/30 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-primary/30 rounded w-4/5 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-primary/30 rounded w-full"></div>
        <div className="h-4 bg-primary/30 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-primary/30 rounded w-20"></div>
        <div className="h-6 bg-primary/30 rounded w-24"></div>
      </div>
      <div className="h-7 bg-primary/30 rounded w-32 mb-4"></div>
      <div className="h-10 bg-primary/30 rounded w-full"></div>
    </div>
  )
}

export function ApplicationCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-5 bg-primary/30 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-primary/30 rounded w-2/3 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-primary/30 rounded w-20"></div>
            <div className="h-6 bg-primary/30 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-primary/30 rounded w-24"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-primary/30 rounded w-24"></div>
          <div className="h-8 bg-primary/30 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 animate-pulse">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/30"></div>
        <div className="flex-1">
          <div className="h-6 bg-primary/30 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-primary/30 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-primary/30 rounded w-2/5"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-primary/30 rounded w-full"></div>
        <div className="h-10 bg-primary/30 rounded w-full"></div>
        <div className="h-10 bg-primary/30 rounded w-full"></div>
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-border"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
      </div>
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && <p className="text-secondary mb-6">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
