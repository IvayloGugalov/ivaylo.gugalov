import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme'
import { Button } from './ui/button'

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className='rounded-lg bg-transparent hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer'
    >
      {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}

export default ThemeToggle
