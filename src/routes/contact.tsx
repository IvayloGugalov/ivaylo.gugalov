import { createFileRoute } from '@tanstack/react-router'
import { Github, Linkedin, Mail } from 'lucide-react'

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
  { icon: Mail, label: 'Email', href: 'mailto:you@example.com', hint: 'you@example.com' },
]

function ContactPage() {
  return (
    <main className='mx-auto max-w-2xl px-4 py-16'>
      <h1 className='font-[Fraunces] text-4xl font-bold text--(--) mb-4'>Contact</h1>
      <p className='text--(--) mb-10'>Find me on the internet.</p>
      <ul className='space-y-4'>
        {LINKS.map(({ icon: Icon, label, href, hint }) => (
          <li key={label}>
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-4 p-4 rounded-xl border border--(--) bg--(--) hover:border--(--) hover:bg--(--) transition-all group'
            >
              <Icon size={20} className='text--(--)' />
              <div>
                <p className='font-medium text--(--) group-hover:text--(--) transition-colors'>
                  {label}
                </p>
                <p className='text-sm text--(--)'>{hint}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
