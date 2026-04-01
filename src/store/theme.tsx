import { createContext, type ReactNode, use, useEffect, useState } from 'react'
import { createClientOnlyFn, createIsomorphicFn } from '@tanstack/react-start'
import { z } from 'zod'
import { ScriptOnce } from '@tanstack/react-router'

const UserThemeSchema = z.enum(['light', 'dark', 'system']).catch('system')
const AppThemeSchema = z.enum(['light', 'dark']).catch('light')

export type UserTheme = z.infer<typeof UserThemeSchema>
export type AppTheme = z.infer<typeof AppThemeSchema>

const themeStorageKey = 'ui-theme'

const getStoredUserTheme = createIsomorphicFn()
  .server((): UserTheme => 'system')
  .client((): UserTheme => {
    const stored = localStorage.getItem(themeStorageKey)
    return UserThemeSchema.parse(stored)
  })

const setStoredTheme = createClientOnlyFn((theme: UserTheme) => {
  const validatedTheme = UserThemeSchema.parse(theme)
  localStorage.setItem(themeStorageKey, validatedTheme)
})

const getSystemTheme = createIsomorphicFn()
  .server((): AppTheme => 'light')
  .client((): AppTheme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

const handleThemeChange = createClientOnlyFn((userTheme: UserTheme) => {
  const validatedTheme = UserThemeSchema.parse(userTheme)

  const root = document.documentElement
  root.classList.remove('light', 'dark', 'system')
  root.removeAttribute('data-theme')
  root.style.colorScheme = ''

  if (validatedTheme === 'system') {
    const systemTheme = getSystemTheme()
    root.classList.add(systemTheme, 'system')
    root.setAttribute('data-theme', systemTheme)
    root.style.colorScheme = systemTheme
  } else {
    root.classList.add(validatedTheme)
    root.setAttribute('data-theme', validatedTheme)
    root.style.colorScheme = validatedTheme
  }
})

const setupPreferredListener = createClientOnlyFn(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => handleThemeChange('system')
  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
})

type ThemeContextProps = {
  userTheme: UserTheme
  appTheme: AppTheme
  setTheme: (theme: UserTheme) => void
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [userTheme, setUserTheme] = useState<UserTheme>(getStoredUserTheme)

  useEffect(() => {
    if (userTheme !== 'system') return
    return setupPreferredListener()
  }, [userTheme])

  const appTheme = userTheme === 'system' ? getSystemTheme() : userTheme

  const setTheme = (newUserTheme: UserTheme) => {
    const validatedTheme = UserThemeSchema.parse(newUserTheme)
    setUserTheme(validatedTheme)
    setStoredTheme(validatedTheme)
    handleThemeChange(validatedTheme)
  }

  return (
    <ThemeContext.Provider value={{ userTheme, appTheme, setTheme }}>
      <ScriptOnce children={THEME_INIT_SCRIPT} />

      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// biome-ignore lint/complexity/useArrowFunction: <explanation>
const THEME_INIT_SCRIPT = (function () {
  function themeFn() {
    try {
      const storedTheme = localStorage.getItem('ui-theme') || 'system'
      const validTheme = ['light', 'dark', 'system'].includes(storedTheme)
        ? storedTheme
        : 'system'

      const root = document.documentElement
      root.classList.remove('light', 'dark', 'system')

      if (validTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme, 'system')
        root.setAttribute('data-theme', systemTheme)
        root.style.colorScheme = systemTheme
      } else {
        root.classList.add(validTheme)
        root.setAttribute('data-theme', validTheme)
        root.style.colorScheme = validTheme
      }
    } catch (e) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      const root = document.documentElement
      root.classList.add(systemTheme, 'system')
      root.setAttribute('data-theme', systemTheme)
      root.style.colorScheme = systemTheme
    }
  }
  return `(${themeFn.toString()})();`
})()
