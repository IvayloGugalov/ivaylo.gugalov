import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/store/theme'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { appTheme, setTheme } = useTheme()
  const mode = appTheme
  const toggle = () => setTheme(mode === 'dark' ? 'light' : 'dark')

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggle}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className='size-11 rounded-lg bg-transparent hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer'
    >
      {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}

export default ThemeToggle
