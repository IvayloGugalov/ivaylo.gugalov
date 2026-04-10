import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL, SITE_NAME } from '@/constants/site'
import { buildMeta } from '@/lib/seo'
import { RepoCard } from '@/components/projects/RepoCard'
import { orpc } from '@/orpc/client'
import FadeContent from '@/components/ui/reactbits/FadeContent'
import { useGithubRepos } from '@/orpc/queries/stats.query'
import * as m from '../paraglide/messages'

export const Route = createFileRoute('/projects')({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(orpc.github.repos.queryOptions())
  },
  staleTime: 60 * 60_000,
  headers: () => ({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  }),
  head: () =>
    buildMeta({
      title: `Projects | ${SITE_NAME}`,
      description: `Open-source work and side projects by ${SITE_NAME}.`,
      url: `${SITE_URL}/projects`,
    }),
  component: ProjectsPage,
})

function ProjectsPage() {
  const { data: repos } = useGithubRepos()

  return (
    <main className='mx-auto max-w-5xl px-4 py-24 md:py-32'>
      <FadeContent blur duration={600}>
        <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>
          {m.projects_heading()}
        </h1>
        <p className='text-text-secondary mb-12'>{m.projects_description()}</p>
      </FadeContent>

      {repos.length === 0 ? (
        <p className='text-text-muted'>{m.projects_no_repos()}</p>
      ) : (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {repos.map((repo, i) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              featured={i === 0}
              className={i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
            />
          ))}
        </div>
      )}
    </main>
  )
}
