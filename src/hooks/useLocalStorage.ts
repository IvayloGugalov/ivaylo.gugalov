import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

// ─── Local Storage Types ────────────────────────────────────────────────────

export type AuthProvider = 'github' | 'google'

export interface LocalStorageSchema {
  lastUsedAuthProvider: AuthProvider
  lastVisitedRoute: string
  dismissedBanners: string[]
}

export type LocalStorageKey = keyof LocalStorageSchema

// ─── Hook ───────────────────────────────────────────────────────────────────

const useLocalStorage = <K extends LocalStorageKey>(
  key: K,
  initialValue?: LocalStorageSchema[K],
): {
  value: LocalStorageSchema[K] | undefined
  set: Dispatch<SetStateAction<LocalStorageSchema[K] | undefined>>
  remove: () => void
} => {
  if (!key) throw new Error('useLocalStorage key may not be falsy')

  const initializer = useRef((k: string) => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = localStorage.getItem(k)
      if (stored !== null) return JSON.parse(stored) as LocalStorageSchema[K]
      if (initialValue !== undefined)
        localStorage.setItem(k, JSON.stringify(initialValue))
      return initialValue
    } catch {
      return initialValue
    }
  })

  const [state, setState] = useState<LocalStorageSchema[K] | undefined>(() =>
    initializer.current(key),
  )

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setState(initializer.current(key))
    }
  }, [key])

  const set: Dispatch<SetStateAction<LocalStorageSchema[K] | undefined>> = useCallback(
    (valOrFunc) => {
      if (typeof window === 'undefined') return
      try {
        const newState = typeof valOrFunc === 'function' ? valOrFunc(state) : valOrFunc
        if (newState === undefined) return
        localStorage.setItem(key, JSON.stringify(newState))
        setState(JSON.parse(JSON.stringify(newState)))
      } catch {}
    },
    [key, state],
  )

  const remove = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
      setState(undefined)
    } catch {}
  }, [key])

  return {
    value: state,
    set,
    remove,
  }
}

export default useLocalStorage
