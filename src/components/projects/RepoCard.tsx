import { GitFork, Star } from 'lucide-react'
import { useRef } from 'react'
import type { Endpoints } from '@octokit/types'
import type { SpringOptions } from 'motion/react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { LanguageDot } from './LanguageDot'
import { Link } from '@tanstack/react-router'

type GitHubRepo = Endpoints['GET /repos/{owner}/{repo}']['response']['data']

interface RepoCardProps {
  repo: GitHubRepo
}

const springValues: SpringOptions = { damping: 30, stiffness: 100, mass: 2 }

export function RepoCard({ repo }: RepoCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    rotateX.set(((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -6)
    rotateY.set(((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 6)
  }

  return (
    <div style={{ perspective: '800px' }} className='row-span-3 grid grid-rows-subgrid'>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
        className='row-span-3 grid grid-rows-subgrid rounded-lg border border-border bg-surface card-glow group'
        onMouseMove={handleMouse}
        onMouseEnter={() => scale.set(1.02)}
        onMouseLeave={() => {
          scale.set(1)
          rotateX.set(0)
          rotateY.set(0)
        }}
      >
        {/* Link also a subgrid passthrough so its 3 children land in the shared row tracks */}
        <Link
          to={repo.html_url}
          target='_blank'
          rel='noopener noreferrer'
          className='row-span-3 grid grid-rows-subgrid rounded-lg cursor-pointer'
        >
          {/* Row 1 — title */}
          <h3 className='font-semibold text-text-primary px-5 pt-5 group-hover:text-accent-primary transition-colors duration-200 self-start'>
            {repo.name}
          </h3>

          {/* Row 2 — description */}
          <div className='px-5 py-2'>
            {repo.description && (
              <p className='text-sm text-text-secondary line-clamp-2'>
                {repo.description}
              </p>
            )}
          </div>

          {/* Row 3 — repo meta */}
          <div className='flex items-center gap-4 px-5 pb-5 self-end'>
            <LanguageDot language={repo.language} />
            <span className='inline-flex items-center gap-1 text-xs text-text-muted'>
              <Star size={11} />
              {repo.stargazers_count}
            </span>
            <span className='inline-flex items-center gap-1 text-xs text-text-muted'>
              <GitFork size={11} />
              {repo.forks_count}
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
