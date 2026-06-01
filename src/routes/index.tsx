import type { ComponentProps } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Github, Linkedin, Mail, ChevronDown } from 'lucide-react'

import Aurora from '@/components/ui/reactbits/Aurora'
import { Hydrate } from '@tanstack/react-start'
import { idle } from '@tanstack/react-start/hydration'
import SplitText from '@/components/ui/reactbits/SplitText'
import FadeContent from '@/components/ui/reactbits/FadeContent'
import { RepoCard } from '@/components/projects/RepoCard'
import {
  GITHUB_PROFILE_URL,
  LINKEDIN_URL,
  CONTACT_EMAIL,
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
} from '@/constants/site'
import { buildMeta } from '@/lib/seo'
import { orpc } from '@/orpc/client'
import * as m from '../paraglide/messages'

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(orpc.github.stats.queryOptions())
    context.queryClient.ensureQueryData(orpc.github.repos.queryOptions())
  },
  staleTime: 60 * 60_000,
  headers: () => ({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  }),
  head: () =>
    buildMeta({
      title: `${SITE_NAME}: Software Engineer`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
    }),
  component: HomePage,
})

function GithubStats() {
  const { data: stats, isPending, isError } = useQuery(
    orpc.github.stats.queryOptions({ staleTime: 60 * 60_000, refetchOnWindowFocus: false }),
  )

  if (isPending) {
    return (
      <span
        aria-hidden='true'
        className='inline-block h-4 w-32 rounded bg-text-muted/20 animate-pulse'
      />
    )
  }

  // Hide the whole line on error or when there are no stars to show.
  if (isError || !stats?.stars) {
    return null
  }

  return (
    <a
      href={GITHUB_PROFILE_URL}
      target='_blank'
      rel='noopener noreferrer'
      className='text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer'
    >
      <span aria-hidden='true'>★</span> {stats.stars} {m.home_github_stars()}
    </a>
  )
}

function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const { data: repos = [], isPending, isError } = useQuery(
    orpc.github.repos.queryOptions({ staleTime: 60 * 60_000, refetchOnWindowFocus: false }),
  )

  const topRepos = [...repos]
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, 3)

  // Only promise scrolling (chevron) and render the section when there is real
  // work to show. Treat the prefetched-but-pending case as "work coming".
  const hasWork = !isError && (isPending || topRepos.length > 0)

  return (
    <main id='main-content'>
      <section className='relative min-h-dvh flex flex-col items-center justify-center'>
        {/* Aurora background */}
        <div className='absolute inset-0 -z-10 opacity-25'>
          <Hydrate when={idle()}>
            <Aurora
              colorStops={['#dd9c42', '#a85700', '#1d0d00']}
              amplitude={1.0}
              blend={0.5}
              speed={0.4}
            />
          </Hydrate>
        </div>

        {/* Subtle vignette */}
        <div
          className='absolute inset-0 -z-10 pointer-events-none'
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, var(--background) 100%)',
          }}
        />

        <div className='relative mx-auto max-w-4xl px-4 py-28 text-left w-full'>
        {/* Kicker */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className='text-sm font-medium text-accent-primary mb-6'
        >
          {m.home_kicker()}
        </motion.p>

        {/* Heading line 1 — SplitText char animation */}
        <SplitText
          text={m.home_hero_line1()}
          tag='h1'
          className='text-6xl md:text-8xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-0'
          splitType='chars'
          delay={20}
          duration={0.6}
          from={{ opacity: 0, y: 24 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.01}
          rootMargin='0px'
          textAlign='left'
        />

        {/* Heading line 2 — gradient span */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className='text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] mb-8'
        >
          <span className='gradient-text'>{m.home_hero_line2()}</span>
          <span className='text-text-primary'>.</span>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className='text-lg leading-relaxed text-text-secondary max-w-xl mb-10'
        >
          {m.home_tagline()}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className='mb-12'
        >
          <Link
            to='/blog'
            viewTransition
            className='inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent-primary text-background font-semibold text-sm hover:bg-accent-glow transition-colors duration-150 active:scale-[0.97] cursor-pointer no-underline'
          >
            {m.home_cta_blog()}
          </Link>
        </motion.div>

        {/* Social icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className='flex items-center gap-4 mb-12'
        >
          <a
            href={GITHUB_PROFILE_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='GitHub'
            className='text-text-muted hover:text-accent-primary transition-colors duration-200 cursor-pointer'
          >
            <Github size={20} />
          </a>
          <a
            href={LINKEDIN_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='LinkedIn'
            className='text-text-muted hover:text-accent-primary transition-colors duration-200 cursor-pointer'
          >
            <Linkedin size={20} />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label='Email'
            className='text-text-muted hover:text-accent-primary transition-colors duration-200 cursor-pointer'
          >
            <Mail size={20} />
          </a>
        </motion.div>

          <GithubStats />
        </div>

        {/* Scroll indicator — links to the work section; hidden when there is none */}
        {hasWork && (
          <motion.a
            href='#selected-work'
            aria-label={m.home_work_scroll_aria()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className='absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer'
          >
            <motion.span
              className='block'
              animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 1.7 }
              }
            >
              <ChevronDown size={22} />
            </motion.span>
          </motion.a>
        )}
      </section>

      {hasWork && <SelectedWork repos={topRepos} isPending={isPending} />}
    </main>
  )
}

function SelectedWork({
  repos,
  isPending,
}: {
  repos: ComponentProps<typeof RepoCard>['repo'][]
  isPending: boolean
}) {
  return (
    <section
      id='selected-work'
      className='relative mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-24 md:py-32'
    >
      <FadeContent blur duration={600}>
        <div className='mb-10 flex items-end justify-between gap-4'>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight text-text-primary'>
            {m.home_work_heading()}
          </h2>
          <Link
            to='/projects'
            viewTransition
            className='group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent-primary hover:text-text-primary transition-colors duration-200 no-underline'
          >
            {m.home_work_view_all()}
            <ArrowUpRight
              size={16}
              className='transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
            />
          </Link>
        </div>
      </FadeContent>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                aria-hidden='true'
                className='h-40 rounded-lg border border-border bg-surface animate-pulse'
              />
            ))
          : repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)}
      </div>
    </section>
  )
}
