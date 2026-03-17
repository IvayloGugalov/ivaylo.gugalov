import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'Portfolio' }] }),
  component: HomePage,
})

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
          I design and build full-stack web applications with a focus on developer experience,
          performance, and clean interfaces.
        </p>
        <div className='flex gap-4'>
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
      </div>
    </main>
  )
}
