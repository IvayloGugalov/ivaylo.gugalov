import { useState } from 'react'
import { getLocale, setLocale } from '../paraglide/runtime'
import type { Locale } from '@/lib/locale'
import { Button } from './ui/button'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  bg: 'БГ',
}

export function LanguageSwitcher() {
  // Local state so the label updates immediately before the page reloads.
  // Initialized from Paraglide's runtime (reads URL → cookie → baseLocale).
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => getLocale() as Locale)
  const nextLocale: Locale = currentLocale === 'en' ? 'bg' : 'en'

  const handleSwitch = () => {
    setCurrentLocale(nextLocale) // optimistic — shows new label instantly
    setLocale(nextLocale) // navigates to /bg/... or /... (full reload)
  }

  return (
    <Button
      onClick={handleSwitch}
      className='px-2 py-1 text-xs font-medium rounded border border-border hover:border-accent-primary transition-colors duration-200 cursor-pointer'
      aria-label={`Switch to ${nextLocale === 'en' ? 'English' : 'Bulgarian'}`}
      title={`Switch to ${nextLocale === 'en' ? 'English' : 'Bulgarian'}`}
    >
      {LOCALE_LABELS[currentLocale]}
    </Button>
  )
}
