import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ProjectTone = 'emerald' | 'sky' | 'stone'
type ProjectStatus = 'Active development' | 'Archived'

type Project = {
  name: string
  description: string
  href: string
  status: ProjectStatus
  tone: ProjectTone
  role: string
  highlights: string[]
}

type Signal = {
  title: string
  body: string
}

const socialLinks = [
  { label: 'Email', href: 'mailto:hello@quinnsprouse.com', icon: Mail },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/quinnsprouse',
    icon: Linkedin,
  },
  { label: 'GitHub', href: 'https://github.com/quinnsprouse', icon: Github },
] as const

const toneClasses: Record<ProjectTone, string> = {
  emerald:
    'border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:border-emerald-300/30 dark:text-emerald-200',
  sky: 'border-sky-400/40 bg-sky-400/10 text-sky-700 dark:border-sky-300/30 dark:text-sky-200',
  stone:
    'border-zinc-400/40 bg-zinc-400/10 text-zinc-700 dark:border-zinc-300/30 dark:text-zinc-200',
}

const quickSignals: Signal[] = [
  {
    title: 'Now',
    body: 'Scaling Lumina Bible with deeper study flows and calm, long-form reading experiences.',
  },
  {
    title: 'Exploring',
    body: 'Documenting quiet travel narratives and new layout experiments for Pocket GR.',
  },
  {
    title: 'Availability',
    body: 'Open to select collaborations where thoughtful design and resilient engineering meet.',
  },
]

const projects: Project[] = [
  {
    name: 'Lumina Bible',
    description:
      'A deep study companion helping people explore scripture with guided readings, contextual insights, and journaling designed for clarity.',
    href: 'https://luminabible.app/',
    status: 'Active development',
    tone: 'emerald',
    role: 'Product · Design · Engineering',
    highlights: ['Guided study', 'Cross-device', 'Calm UI'],
  },
  {
    name: 'Pocket GR',
    description:
      'A personal photography space for quiet travel moments, pairing minimal storytelling layouts with fast image curation.',
    href: 'https://pocketgr.com/',
    status: 'Active development',
    tone: 'sky',
    role: 'Design system · Front-end',
    highlights: ['Photography', 'Story builder', 'Next.js'],
  },
  {
    name: 'Workit',
    description:
      'A focused workout companion that turned routines into adaptable habit loops, making progress feel simple and sustainable.',
    href: 'https://workit-three.vercel.app/',
    status: 'Archived',
    tone: 'stone',
    role: 'Product experiment',
    highlights: ['Workout flows', 'Responsive web', 'TypeScript'],
  },
]

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const year = new Date().getFullYear()
  const [emailLink, linkedinLink, githubLink] = socialLinks

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-300/40 via-sky-200/30 to-transparent blur-3xl" />
      </div>
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-[22rem] w-[22rem] rounded-full bg-gradient-to-tr from-rose-300/25 via-purple-300/20 to-transparent blur-[110px]" />

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-24 px-6 py-16 sm:px-10 lg:px-16">
        <header className="space-y-12">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
                  <span className="relative size-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
                </span>
                <span>Quinn Sprouse</span>
              </span>
              <span className="hidden h-px min-w-[120px] flex-1 bg-gradient-to-r from-transparent via-border to-transparent sm:flex" />
              <span>Product engineer & designer</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
                Crafting calm, considered digital products that feel inevitable.
              </h1>
              <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
                I build tools for focus, study, and personal disciplines—pairing human-centered design with resilient front-end architecture.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full px-6" asChild>
                <a href={emailLink.href}>
                  {emailLink.label} me
                  <Mail className="size-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-6"
                asChild
              >
                <a
                  href={linkedinLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connect on {linkedinLink.label}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border/60 bg-card/70 hover:bg-card"
                asChild
              >
                <a
                  href={githubLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{githubLink.label}</span>
                  <Github className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {quickSignals.map((signal) => (
              <div
                key={signal.title}
                className="group rounded-2xl border border-border/70 bg-card/70 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.03)] transition duration-300 hover:border-foreground/20 hover:shadow-[0_16px_60px_rgba(15,23,42,0.08)]"
              >
                <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  {signal.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground">
                  {signal.body}
                </p>
              </div>
            ))}
          </div>
        </header>

        <section className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Featured work
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Projects shaping how people study, move, and remember.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col gap-5 rounded-3xl border border-border/70 bg-card/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:bg-card hover:shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    {project.role}
                  </p>
                  <Badge
                    className={cn(
                      'rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.35em]',
                      toneClasses[project.tone],
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-2xl font-medium tracking-tight group-hover:text-foreground">
                    {project.name}
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/90">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {project.highlights.map((highlight) => (
                    <Badge
                      key={highlight}
                      variant="outline"
                      className="rounded-full border-border/60 bg-transparent px-3 py-1 text-xs font-medium text-muted-foreground transition group-hover:border-foreground/30 group-hover:text-foreground/90"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-auto border-t border-border/60 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {year} Quinn Sprouse. Crafted with intention.</p>
            <div className="flex flex-wrap items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon
                const isExternal = link.href.startsWith('http')
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 transition hover:border-foreground/30 hover:text-foreground"
                  >
                    <Icon className="size-4" />
                    <span>{link.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
