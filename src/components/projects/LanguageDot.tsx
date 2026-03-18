const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
}

interface LanguageDotProps {
  language: string | null
}

export function LanguageDot({ language }: LanguageDotProps) {
  if (!language) return null
  const color = LANGUAGE_COLORS[language] ?? '#8b8b8b'
  return (
    <span className='inline-flex items-center gap-1.5 text-xs text--(--)'>
      <span className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: color }} />
      {language}
    </span>
  )
}
