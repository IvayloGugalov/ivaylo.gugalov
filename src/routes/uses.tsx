import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/uses')({
  head: () => ({ meta: [{ title: 'Uses | Portfolio' }] }),
  component: UsesPage,
})

function UsesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-[Fraunces] text-4xl font-bold text--(--) mb-4">Uses</h1>
      <p className="text--(--) mb-10">The tools, hardware, and software I use daily.</p>
      <div className="space-y-10">
        <Section title="Editor">
          <Item label="VS Code" description="Primary editor with a custom dark theme." />
          <Item label="Claude Code" description="AI pair programmer for complex refactors." />
        </Section>
        <Section title="Hardware">
          <Item label="PC" description="Custom-built Windows 11 workstation." />
        </Section>
        <Section title="Terminal">
          <Item label="Windows Terminal + Git Bash" description="Gets the job done." />
        </Section>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-[Fraunces] text-xl font-bold text--(--) mb-4 pb-2 border-b border--(--)">
        {title}
      </h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

function Item({ label, description }: { label: string; description: string }) {
  return (
    <li className="flex gap-3">
      <span className="font-medium text--(--) w-40 shrink-0">{label}</span>
      <span className="text--(--) text-sm">{description}</span>
    </li>
  )
}
