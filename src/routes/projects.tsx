import { createFileRoute } from '@tanstack/react-router'
import { RepoCard } from '@/components/projects/RepoCard'
import { client } from '@/orpc/client'
import FadeContent from '@/components/ui/reactbits/FadeContent'

export const Route = createFileRoute('/projects')({
  loader: async () => {
    const repos = await client.github.repos()
    return { repos }
  },
  head: () => ({
    meta: [{ title: 'Projects | Portfolio' }],
  }),
  component: ProjectsPage,
})

function ProjectsPage() {
  const { repos } = Route.useLoaderData()

  return (
    <main className='mx-auto max-w-5xl px-4 py-24 md:py-32'>
      <FadeContent blur duration={600}>
        <p className='text-xs font-semibold tracking-widest text-accent-primary uppercase mb-4'>
          Projects
        </p>
        <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>
          Things I've built.
        </h1>
        <p className='text-text-secondary mb-12'>
          A selection of open-source work and side projects.
        </p>
      </FadeContent>

      {repos.length === 0 ? (
        <p className='text-text-muted'>No public repositories found.</p>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </main>
  )
}
