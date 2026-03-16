import { GitFork, Star } from 'lucide-react'
import type { GitHubRepo } from '#/lib/github'
import { LanguageDot } from './LanguageDot'

interface RepoCardProps {
  repo: GitHubRepo
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 hover:bg-[var(--surface-strong)] hover:border-[var(--lagoon)] transition-all"
    >
      <h3 className="font-semibold text-[var(--sea-ink)] group-hover:text-[var(--lagoon)] transition-colors mb-1">
        {repo.name}
      </h3>
      {repo.description && (
        <p className="text-sm text-[var(--sea-ink-soft)] mb-4 line-clamp-2">{repo.description}</p>
      )}
      <div className="flex items-center gap-4 mt-auto">
        <LanguageDot language={repo.language} />
        <span className="inline-flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
          <Star size={12} />
          {repo.stargazers_count}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-[var(--sea-ink-soft)]">
          <GitFork size={12} />
          {repo.forks_count}
        </span>
      </div>
    </a>
  )
}
