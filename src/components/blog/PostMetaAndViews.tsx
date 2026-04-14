'use client'

import { Suspense, useEffect } from 'react'
import { client } from '@/orpc/client'
import { useGetPostMeta } from '@/hooks/queries/blog.query'

interface ViewsLineProps {
  slug: string
  date: string
}

function ViewsLine({ slug, date }: ViewsLineProps) {
  const { data: meta } = useGetPostMeta(slug)
  return (
    <p className='text-sm text-text-muted mb-2'>
      {new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}{' '}
      · {meta.views} views
    </p>
  )
}

interface PostMetaAndViewsProps {
  slug: string
  date: string
  title: string
}

export function PostMetaAndViews({ slug, date, title }: PostMetaAndViewsProps) {
  useEffect(() => {
    client.blog.incrementViews({ slug, title })
  }, [slug, title])

  return (
    <Suspense
      fallback={
        <p className='text-sm text-text-muted mb-2'>
          {new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      }
    >
      <ViewsLine slug={slug} date={date} />
    </Suspense>
  )
}
