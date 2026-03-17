import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Star } from 'lucide-react'

import { Counter } from '@/components/counter'
import { GITHUB_PROFILE_URL } from '@/constants/site'
import { useGithubStats } from '@/orpc/queries/stats.query'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Portfolio' }] }),
  component: HomePage,
})

function GithubStats() {
  const { data } = useGithubStats()

  if (!data) return null

  return (
    <a
      href={GITHUB_PROFILE_URL}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center gap-3 rounded-xl border border-(--line) px-4 py-3 transition-colors hover:bg-(--surface-raised)'
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, #fee000 8%, var(--surface)), color-mix(in srgb, #ffce63 4%, var(--surface)))',
      }}
    >
      <Star className='size-6 text-[#fee000]' fill='#fee000' />
      <div className='flex flex-col leading-tight'>
        <Counter value={data.stars} className='text-lg font-semibold text-(--sea-ink)' />
        <span className='text-xs text-(--sea-ink-soft)'>GitHub stars</span>
      </div>
    </a>
  )
}

function HomePage() {
  return (
    <main className='mx-auto max-w-4xl px-4 py-24'>
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, var(--hero-a), transparent), radial-gradient(ellipse 40% 30% at 70% 30%, var(--hero-b), transparent)',
        }}
      />
      <div className='relative'>
        <p className='text-sm font-semibold tracking-widest uppercase text-(--lagoon) mb-4'>
          Software Engineer
        </p>
        <h1 className='font-[Fraunces] text-5xl sm:text-6xl font-bold text-(--sea-ink) mb-6 leading-tight'>
          Building things
          <br />
          that matter.
        </h1>
        <p className='text-lg text-(--sea-ink-soft) max-w-xl mb-10'>
          I design and build full-stack web applications with a focus on developer
          experience, performance, and clean interfaces.
        </p>
        <div className='flex gap-4 mb-10'>
          <Link
            to='/projects'
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-(--lagoon) text-white font-medium hover:bg-(--lagoon-deep) transition-colors'
          >
            View projects <ArrowRight size={16} />
          </Link>
          <Link
            to='/blog'
            className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-(--line) text-(--sea-ink) font-medium hover:bg-(--surface) transition-colors'
          >
            Read blog
          </Link>
        </div>
        <GithubStats />
      </div>
    </main>
  )
}
