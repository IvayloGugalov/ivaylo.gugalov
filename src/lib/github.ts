import { GITHUB_USERNAME, WHITELISTED_REPOS } from './whitelist'

export interface GitHubRepo {
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
}

export async function fetchWhitelistedRepos(): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN

  const results = await Promise.all(
    WHITELISTED_REPOS.map(async (repo) => {
      const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repo}`
      const res = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) {
        console.warn(`GitHub API: ${res.status} for repo ${repo}`)
        return null
      }

      return res.json() as Promise<GitHubRepo>
    })
  )

  return results.filter((r): r is GitHubRepo => r !== null)
}
