import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import ScrollReveal from '@/components/ui/reactbits/ScrollReveal'
import FadeContent from '@/components/ui/reactbits/FadeContent'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About | Portfolio' }] }),
  component: About,
})

const SKILLS = [
  {
    category: 'Frontend',
    items: [
      { name: 'React / Next.js', level: 90 },
      { name: 'TypeScript', level: 88 },
      { name: 'Tailwind CSS', level: 85 },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: '.NET / C#', level: 85 },
      { name: 'Node.js', level: 78 },
      { name: 'PostgreSQL', level: 75 },
    ],
  },
  {
    category: 'Cloud & Data',
    items: [
      { name: 'Azure', level: 72 },
      { name: 'Docker', level: 70 },
      { name: 'Redis', level: 65 },
    ],
  },
  {
    category: 'Tooling',
    items: [
      { name: 'Git / GitHub', level: 92 },
      { name: 'Vite / Bun', level: 80 },
      { name: 'CI/CD', level: 68 },
    ],
  },
]

function SkillBar({ name, level }: { name: string; level: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimate(true)
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className='flex items-center gap-4 py-2'>
      <span className='text-sm text-text-secondary w-36 flex-shrink-0'>{name}</span>
      <div className='flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden'>
        <div
          style={
            {
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #22d3ee, #2dd4bf)',
              width: animate ? `${level}%` : '0%',
              transition: 'width 700ms ease-out',
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}

function About() {
  return (
    <main className='mx-auto max-w-2xl px-4 py-24 md:py-32'>
      <FadeContent blur duration={600}>
        <p className='text-xs font-semibold tracking-widest text-accent-primary uppercase mb-4'>
          About
        </p>
        <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-8'>
          I build full-stack products.
        </h1>
      </FadeContent>

      <div className='space-y-2 mb-12'>
        <ScrollReveal
          containerClassName='!text-lg !text-text-secondary !leading-relaxed'
          textClassName='!text-lg !text-text-secondary !leading-relaxed'
          enableBlur
          blurStrength={3}
          baseRotation={1}
        >
          I'm a full-stack engineer focused on TypeScript, React, and .NET — building
          products that feel fast and look intentional.
        </ScrollReveal>

        <ScrollReveal
          containerClassName='!text-lg !text-text-secondary !leading-relaxed'
          textClassName='!text-lg !text-text-secondary !leading-relaxed'
          enableBlur
          blurStrength={3}
          baseRotation={1}
        >
          I've spent the past few years working across the full stack — from polished
          frontend interfaces to well-structured APIs and reliable data layers. Developer
          experience matters as much as user experience.
        </ScrollReveal>

        <ScrollReveal
          containerClassName='!text-lg !text-text-secondary !leading-relaxed'
          textClassName='!text-lg !text-text-secondary !leading-relaxed'
          enableBlur
          blurStrength={3}
          baseRotation={1}
        >
          Outside of work I write about what I'm learning, contribute to open source, and
          occasionally build tools just for the joy of it.
        </ScrollReveal>
      </div>

      <FadeContent blur delay={100} duration={600}>
        <div className='mb-12'>
          <p className='text-xs font-semibold tracking-widest text-accent-primary uppercase mb-6'>
            Skills
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6'>
            {SKILLS.map((group) => (
              <div key={group.category}>
                <p className='text-xs font-semibold tracking-wider text-text-muted uppercase mb-3'>
                  {group.category}
                </p>
                {group.items.map((item) => (
                  <SkillBar key={item.name} name={item.name} level={item.level} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </FadeContent>

      <hr className='border-border mb-6' />
      <p className='text-sm text-text-muted'>Currently open to new opportunities.</p>
    </main>
  )
}
