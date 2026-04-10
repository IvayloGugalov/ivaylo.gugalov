import { Link } from '@tanstack/react-router'
import * as m from '../paraglide/messages'

export function NotFound() {
  return (
    <main className='mx-auto max-w-4xl px-4 py-32 text-center'>
      <p className='text-6xl font-bold text-accent-primary mb-4'>{m.error_404_code()}</p>
      <h1 className='text-3xl font-bold text-text-primary mb-4'>
        {m.error_404_heading()}
      </h1>
      <p className='text-text-secondary mb-8'>
        {m.error_404_description()}
      </p>
      <Link
        to='/'
        className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-primary text-background text-sm font-medium hover:bg-accent-glow transition-colors'
      >
        {m.error_404_go_home()}
      </Link>
    </main>
  )
}
