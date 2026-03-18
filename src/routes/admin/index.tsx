import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Users, MessageSquare, Heart, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAdminStats, useAdminTrends } from '@/orpc/queries/admin.query'
import { StatCard } from '@/components/admin/StatCard'
import { TrendChart } from '@/components/admin/TrendChart'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

function AdminDashboard() {
  const [days, setDays] = useState(30)
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats()
  const { data: trends, isLoading: trendsLoading, isError: trendsError } = useAdminTrends({ days, timezone: TIMEZONE })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Users" value={stats?.totalUsers} icon={Users} isLoading={statsLoading} isError={statsError} />
        <StatCard label="Comments" value={stats?.totalComments} icon={MessageSquare} isLoading={statsLoading} isError={statsError} />
        <StatCard label="Reactions" value={stats?.totalReactions} icon={Heart} isLoading={statsLoading} isError={statsError} />
        <StatCard label="Posts" value={stats?.totalPosts} icon={FileText} isLoading={statsLoading} isError={statsError} />
      </div>

      {/* Day range selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size="sm"
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
