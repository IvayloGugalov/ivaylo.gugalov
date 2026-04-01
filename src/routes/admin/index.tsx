import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Users, MessageSquare, Heart, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAdminStats, useAdminTrends } from '@/orpc/queries/admin.query'
import { StatCard } from '@/components/admin/StatCard'
import { TrendChart } from '@/components/admin/TrendChart'
import { orpc } from '@/orpc/client'

export const Route = createFileRoute('/admin/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(orpc.admin.stats.queryOptions()),
  pendingComponent: AdminDashboardSkeleton,
  component: AdminDashboard,
})

function AdminDashboardSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='h-8 w-32 animate-pulse rounded-md bg-muted' />

      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {[Users, MessageSquare, Heart, FileText].map((Icon) => (
          <Card key={Icon.displayName ?? Icon.name} size='sm'>
            <CardHeader>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Icon className='size-4' />
                <div className='h-4 w-16 animate-pulse rounded bg-muted' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='h-8 w-24 animate-pulse rounded-md bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex gap-2'>
        {[7, 30, 90].map((d) => (
          <Button key={d} variant='outline' size='sm' disabled>
            {d}d
          </Button>
        ))}
      </div>

      <div className='h-64 w-full animate-pulse rounded-md bg-muted' />
    </div>
  )
}

function AdminDashboard() {
  const [days, setDays] = useState(30)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats()
  const {
    data: trends,
    isLoading: trendsLoading,
    isError: trendsError,
  } = useAdminTrends({ days, timezone })

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Dashboard</h1>

      {/* Stat cards grid */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard
          label='Users'
          value={stats?.totalUsers}
          icon={Users}
          isLoading={statsLoading}
          isError={statsError}
        />
        <StatCard
          label='Comments'
          value={stats?.totalComments}
          icon={MessageSquare}
          isLoading={statsLoading}
          isError={statsError}
        />
        <StatCard
          label='Reactions'
          value={stats?.totalReactions}
          icon={Heart}
          isLoading={statsLoading}
          isError={statsError}
        />
        <StatCard
          label='Posts'
          value={stats?.totalPosts}
          icon={FileText}
          isLoading={statsLoading}
          isError={statsError}
        />
      </div>

      {/* Day range selector */}
      <div className='flex gap-2'>
        {[7, 30, 90].map((d) => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size='sm'
            onClick={() => setDays(d)}
          >
            {d}d
          </Button>
        ))}
      </div>

      {/* Trend chart */}
      <TrendChart data={trends ?? []} isLoading={trendsLoading} isError={trendsError} />
    </div>
  )
}
