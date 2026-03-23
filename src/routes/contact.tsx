import { createFileRoute } from '@tanstack/react-router'
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react'
import FadeContent from '@/components/ui/reactbits/FadeContent'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact | Portfolio' }] }),
  component: ContactPage,
})

const LINKS = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/your-username',
    hint: '@your-username',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/your-profile',
    hint: 'your-profile',
  },
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:you@example.com',
    hint: 'you@example.com',
  },
]

function ContactPage() {
  return (
    <main className='mx-auto max-w-2xl px-4 py-24 md:py-32'>
      <FadeContent blur duration={600}>
        <p className='text-xs font-semibold tracking-widest text-accent-primary uppercase mb-4'>
          Contact
        </p>
        <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>
          Let's connect.
        </h1>
        <p className='text-text-secondary mb-12'>
          I'm best reached via email or LinkedIn.
        </p>
      </FadeContent>

      <FadeContent duration={600} delay={100}>
        <ul className='list-none p-0 m-0'>
          {LINKS.map(({ icon: Icon, label, href, hint }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel='noopener noreferrer'
                className='group flex items-center justify-between py-4 border-b border-border hover:bg-surface transition-colors duration-200 no-underline px-2 -mx-2 rounded-sm cursor-pointer'
              >
                <div className='flex items-center gap-3'>
                  <Icon
                    size={18}
                    className='text-text-muted group-hover:text-accent-primary transition-colors duration-200'
                  />
                  <div>
                    <p className='text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors duration-200 m-0'>
                      {label}
                    </p>
                    <p className='text-xs text-text-muted m-0'>{hint}</p>
                  </div>
                </div>
                <ExternalLink
                  size={14}
                  className='text-text-muted group-hover:text-accent-primary group-hover:translate-x-1 transition-all duration-200'
                />
              </a>
            </li>
          ))}
        </ul>
      </FadeContent>
    </main>
  )
}
