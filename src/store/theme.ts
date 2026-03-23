import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
}

function resolveSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(mode)
  root.setAttribute('data-theme', mode)
  root.style.colorScheme = mode
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: resolveSystemTheme(),
      setMode: (mode) => {
        set({ mode })
        applyTheme(mode)
      },
      toggle: () => {
        const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark'
        get().setMode(next)
      },
    }),
    {
      name: 'theme',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Migrate old 'auto' value from previous storage
        const mode = (state.mode as string) === 'auto'
          ? resolveSystemTheme()
          : state.mode
        applyTheme(mode)
        if (mode !== state.mode) state.mode = mode
      },
    },
  ),
)
