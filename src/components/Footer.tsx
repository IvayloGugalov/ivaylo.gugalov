import { Github, Linkedin, Mail } from 'lucide-react'
import { GITHUB_PROFILE_URL, LINKEDIN_URL, CONTACT_EMAIL } from '@/constants/site'
import * as m from '../paraglide/messages'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className='site-footer mt-20 px-4 pb-10 pt-8 text-text-muted'>
      <div className='page-wrap flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <p className='m-0 text-sm'>{m.footer_copyright({ year })}</p>
        <div className='flex items-center gap-3'>
          <a
            href={GITHUB_PROFILE_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='GitHub'
            className='p-2 text-text-muted hover:text-accent-primary transition-colors duration-200 rounded-md'
          >
            <Github size={18} />
          </a>
          <a
            href={LINKEDIN_URL}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='LinkedIn'
            className='p-2 text-text-muted hover:text-accent-primary transition-colors duration-200 rounded-md'
          >
            <Linkedin size={18} />
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            aria-label='Email'
            className='p-2 text-text-muted hover:text-accent-primary transition-colors duration-200 rounded-md'
          >
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
