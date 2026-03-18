import type { ComponentType } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number | undefined
  icon: ComponentType<{ className?: string }>
  isLoading?: boolean
  isError?: boolean
}

export function StatCard({ label, value, icon: Icon, isLoading, isError }: StatCardProps) {
  return (
    <Card size='sm'>
      <CardHeader>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Icon className='size-4' />
          <span className='text-sm font-medium'>{label}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='h-8 w-24 animate-pulse rounded-md bg-muted' />
        ) : isError || value === undefined ? (
          <span className='text-2xl font-bold text-muted-foreground'>—</span>
        ) : (
          <span className='text-2xl font-bold text-foreground'>
            {value.toLocaleString()}
          </span>
        )}
      </CardContent>
    </Card>
  )
}
