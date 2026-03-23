import { RateLimiter } from '@tanstack/pacer'

type WindowString = `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`

function parseWindow(w: WindowString): number {
  const [n, unit] = w.split(' ')
  const units: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  }
  return Number(n) * (units[unit] ?? 1_000)
}

class Ratelimit {
  private limiters = new Map<string, RateLimiter<() => void>>()

  private constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly windowType: 'sliding' | 'fixed',
  ) {}

  static slidingWindow(limit: number, window: WindowString) {
    return new Ratelimit(limit, parseWindow(window), 'sliding')
  }

  static fixedWindow(limit: number, window: WindowString) {
    return new Ratelimit(limit, parseWindow(window), 'fixed')
  }

  check(key: string) {
    let limiter = this.limiters.get(key)
    if (!limiter) {
      limiter = new RateLimiter<() => void>(() => {}, {
        limit: this.limit,
        window: this.windowMs,
        windowType: this.windowType,
      })
      this.limiters.set(key, limiter)
    }

    const allowed = limiter.maybeExecute()
    return {
      allowed,
      remaining: limiter.getRemainingInWindow(),
      retryAfter: allowed ? 0 : limiter.getMsUntilNextWindow(),
    }
  }
}

export const commentRatelimit = Ratelimit.slidingWindow(5, '1 m')
export const reactionRatelimit = Ratelimit.slidingWindow(20, '1 m')
export const apiRatelimit = Ratelimit.slidingWindow(60, '1 m')
