import { createFileRoute } from '@tanstack/react-router'
import { RepoCard } from '@/components/projects/RepoCard'
import { client } from '@/orpc/client'

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
    <main className='mx-auto max-w-4xl px-4 py-16'>
      <h1 className='font-[Fraunces] text-4xl font-bold text--(--) mb-4'>Projects</h1>
      <p className='text--(--) mb-10'>A selection of things I've built.</p>
      {repos.length === 0 ? (
        <p className='text--(--)'>No public repositories found.</p>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          {repos.map((repo) => (
            <RepoCard key={repo.name} repo={repo} />
          ))}
        </div>
      )}
    </main>
  )
}
