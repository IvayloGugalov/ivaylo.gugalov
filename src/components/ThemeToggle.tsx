import { Moon, Sun, SunMoon } from 'lucide-react'
import { useThemeStore } from '@/store/theme'
import { Button } from './ui/Button'

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)

  const icon =
    mode === 'dark' ? (
      <Moon size={16} />
    ) : mode === 'light' ? (
      <Sun size={16} />
    ) : (
      <SunMoon size={16} />
    )

  const label =
    mode === 'dark'
      ? 'Switch to auto'
      : mode === 'light'
        ? 'Switch to dark'
        : 'Switch to light'

  return (
    <Button
      onClick={toggle}
      aria-label={label}
      className='p-2 rounded-lg hover:bg--(--) transition-colors text--(--) hover:text--(--)'
    >
      {icon}
    </Button>
  )
}

export default ThemeToggle
