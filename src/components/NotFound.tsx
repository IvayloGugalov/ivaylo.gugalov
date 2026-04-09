import { Link } from '@tanstack/react-router'
import * as m from '../paraglide/messages'

export function NotFound() {
  return (
    <main className='mx-auto max-w-4xl px-4 py-32 text-center'>
      <p className='text-6xl font-bold text-(--lagoon) mb-4'>{m.error_404_code()}</p>
      <h1 className='font-[Fraunces] text-3xl font-bold text-(--sea-ink) mb-4'>
        {m.error_404_heading()}
      </h1>
      <p className='text-(--sea-ink-soft) mb-8'>
        {m.error_404_description()}
      </p>
      <Link
        to='/'
        className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-(--lagoon) text-white text-sm font-medium hover:bg-(--lagoon-deep) transition-colors'
      >
        {m.error_404_go_home()}
      </Link>
    </main>
  )
}
