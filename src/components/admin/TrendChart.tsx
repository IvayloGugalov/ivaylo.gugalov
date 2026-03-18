import type React from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface TrendChartProps {
  data: Array<{ date: string; comments: number; reactions: number }>
  isLoading?: boolean
  isError?: boolean
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function TrendChart({ data = [], isLoading, isError }: TrendChartProps) {
  const tickInterval = data.length > 14 ? Math.ceil(data.length / 10) - 1 : 0

  let content: React.ReactNode

  if (isLoading) {
    content = <div className='h-64 w-full animate-pulse rounded-md bg-muted' />
  } else if (isError) {
    content = (
      <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
        Failed to load trend data
      </div>
    )
  } else if (data.length === 0) {
    content = (
      <div className='flex h-64 items-center justify-center text-muted-foreground text-sm'>
        No activity data yet
      </div>
    )
  } else {
    content = (
      <ResponsiveContainer width='100%' height={256}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
          <XAxis
            dataKey='date'
            tickFormatter={formatDate}
            interval={tickInterval}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelFormatter={formatDate}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey='comments'
            name='Comments'
            fill='var(--color-chart-1, #6366f1)'
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey='reactions'
            name='Reactions'
            fill='var(--color-chart-2, #ec4899)'
            radius={[3, 3, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <span className='text-base font-medium'>Activity Trend</span>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}
