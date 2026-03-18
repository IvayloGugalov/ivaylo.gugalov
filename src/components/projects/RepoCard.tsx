import { GitFork, Star } from 'lucide-react'
import type { Endpoints } from '@octokit/types'
import { LanguageDot } from './LanguageDot'

type GitHubRepo = Endpoints['GET /repos/{owner}/{repo}']['response']['data']

interface RepoCardProps {
  repo: GitHubRepo
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <a
      href={repo.html_url}
      target='_blank'
      rel='noopener noreferrer'
      className='group block rounded-xl border border--(--) bg--(--) p-5 hover:bg--(--) hover:border--(--) transition-all'
    >
      <h3 className='font-semibold text--(--) group-hover:text--(--) transition-colors mb-1'>
        {repo.name}
      </h3>
      {repo.description && (
        <p className='text-sm text--(--) mb-4 line-clamp-2'>{repo.description}</p>
      )}
      <div className='flex items-center gap-4 mt-auto'>
        <LanguageDot language={repo.language} />
        <span className='inline-flex items-center gap-1 text-xs text--(--)'>
          <Star size={12} />
          {repo.stargazers_count}
        </span>
        <span className='inline-flex items-center gap-1 text-xs text--(--)'>
          <GitFork size={12} />
          {repo.forks_count}
        </span>
      </div>
    </a>
  )
}
