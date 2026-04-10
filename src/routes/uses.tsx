import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL, SITE_NAME } from '@/constants/site'
import { buildMeta } from '@/lib/seo'
import * as m from '../paraglide/messages'

export const Route = createFileRoute('/uses')({
  head: () =>
    buildMeta({
      title: `Uses | ${SITE_NAME}`,
      description: `The tools, hardware, and software ${SITE_NAME} uses daily.`,
      url: `${SITE_URL}/uses`,
    }),
  component: UsesPage,
})

function UsesPage() {
  return (
    <main className='mx-auto max-w-3xl px-4 py-24 md:py-32'>
      <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>{m.uses_heading()}</h1>
      <p className='text-text-secondary mb-12'>{m.uses_description()}</p>
      <div className='space-y-10'>
        <Section title={m.uses_section_editor()}>
          <Item label='VS Code' description='Primary editor with a custom dark theme.' />
          <Item
            label='Claude Code'
            description='AI pair programmer for complex refactors.'
          />
        </Section>
        <Section title={m.uses_section_hardware()}>
          <Item label='PC' description='Custom-built Windows 11 workstation.' />
        </Section>
        <Section title={m.uses_section_terminal()}>
          <Item label='Windows Terminal + Git Bash' description='Gets the job done.' />
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className='text-xl font-semibold text-text-primary mb-4 pb-2 border-b border-border'>
        {title}
      </h2>
      <ul className='space-y-3'>{children}</ul>
    </div>
  )
}

function Item({ label, description }: { label: string; description: string }) {
  return (
    <li className='flex gap-3'>
      <span className='font-medium text-text-primary w-40 shrink-0'>{label}</span>
      <span className='text-text-secondary text-sm'>{description}</span>
    </li>
  )
}
