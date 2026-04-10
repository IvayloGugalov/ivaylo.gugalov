import { createFileRoute, Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Github, Linkedin, Mail, ChevronDown } from 'lucide-react'

import Aurora from '@/components/ui/reactbits/Aurora'
import SplitText from '@/components/ui/reactbits/SplitText'
import { GITHUB_PROFILE_URL, SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/constants/site'
import { buildMeta } from '@/lib/seo'
import { orpc } from '@/orpc/client'
import { useGithubStats } from '@/orpc/queries/stats.query'
import * as m from '../paraglide/messages'

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(orpc.github.stats.queryOptions())
  },
  staleTime: 60 * 60_000,
  headers: () => ({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  }),
  head: () =>
    buildMeta({
      title: `${SITE_NAME} — Software Engineer`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
    }),
  component: HomePage,
})

function GithubStats() {
  const { data: stats } = useGithubStats()

  return (
    <a
      href={GITHUB_PROFILE_URL}
      target='_blank'
      rel='noopener noreferrer'
      className='text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer'
    >
      ★ {stats.stars} GitHub stars
    </a>
  )
}

function HomePage() {
  return (
    <main id='main-content' className='relative min-h-dvh flex flex-col items-center justify-center'>
      {/* Aurora background */}
      <div className='absolute inset-0 -z-10 opacity-25'>
        <Aurora
          colorStops={['oklch(0.74 0.13 72)', 'oklch(0.54 0.15 65)', 'oklch(0.18 0.04 65)']}
          amplitude={1.0}
          blend={0.5}
          speed={0.4}
        />
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
            className='inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent-primary text-background font-semibold text-sm hover:bg-foreground hover:text-background transition-[background-color,color] duration-150 active:scale-[0.97] cursor-pointer no-underline'
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
            href='https://github.com/your-username'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='GitHub'
            className='text-text-muted hover:text-accent-primary transition-colors duration-200 cursor-pointer'
          >
            <Github size={20} />
          </a>
          <a
            href='https://linkedin.com/in/your-profile'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='LinkedIn'
            className='text-text-muted hover:text-accent-primary transition-colors duration-200 cursor-pointer'
          >
            <Linkedin size={20} />
          </a>
          <a
            href='mailto:you@example.com'
            aria-label='Email'
            className='text-text-muted hover:text-accent-primary transition-colors duration-200 cursor-pointer'
          >
            <Mail size={20} />
          </a>
        </motion.div>

        <GithubStats />
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className='absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted'
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 1.7 }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </motion.div>
    </main>
  )
}
