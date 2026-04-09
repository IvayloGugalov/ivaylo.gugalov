import { extractLocaleFromRequest } from '../paraglide/runtime'

export const SUPPORTED_LOCALES = ['en', 'bg'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isValidLocale(v: unknown): v is Locale {
  return SUPPORTED_LOCALES.includes(v as Locale)
}

export function detectLocale(request?: Request): Locale {
  if (request) {
    // Use Paraglide's built-in extraction (handles cookie + Accept-Language)
    const extracted = extractLocaleFromRequest(request)
    if (extracted && isValidLocale(extracted)) return extracted
  }

  // Client side: check cookie
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/PARAGLIDE_LOCALE=([^;]+)/)
    if (match && isValidLocale(match[1])) return match[1] as Locale
  }

  return DEFAULT_LOCALE
}
