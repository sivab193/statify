import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('p-6 space-y-4', className)}>
      <div className="h-5 w-40 rounded bg-muted animate-pulse" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
      </div>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="h-32" />
        ))}
      </div>
      <CardSkeleton className="h-[420px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-72" />
        <CardSkeleton className="h-72" />
      </div>
    </div>
  )
}
