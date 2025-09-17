import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowUpRight } from 'lucide-react'

const getGitHubRepoInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    const repos = [
      { name: 'bible-app', url: 'quinnsprouse/bible-app' },
      { name: 'personal-photo-blog', url: 'quinnsprouse/personal-photo-blog' },
      { name: 'workit', url: 'quinnsprouse/workit' },
    ]

    const repoData: Record<string, { lastUpdated: string }> = {}

    // Check for GitHub token in environment variable (optional)
    const token = process.env.GITHUB_TOKEN

    for (const repo of repos) {
      try {
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Portfolio-Website'
        }

        // Add auth header if token is available
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`https://api.github.com/repos/${repo.url}`, { headers })

        if (response.ok) {
          const data = await response.json()
          repoData[repo.name] = {
            lastUpdated: new Date(data.pushed_at).toISOString().split('T')[0]
          }
        } else if (response.status === 404 || response.status === 401) {
          // Private repo without auth - use fallback dates
          const fallbackDates: Record<string, string> = {
            'bible-app': '2024-12-18',
            'personal-photo-blog': '2024-12-15',
            'workit': '2023-11-22',
          }
          if (fallbackDates[repo.name]) {
            repoData[repo.name] = { lastUpdated: fallbackDates[repo.name] }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${repo.name}:`, error)
        // Use fallback dates on error
        const fallbackDates: Record<string, string> = {
          'bible-app': '2024-12-18',
          'personal-photo-blog': '2024-12-15',
          'workit': '2023-11-22',
        }
        if (fallbackDates[repo.name]) {
          repoData[repo.name] = { lastUpdated: fallbackDates[repo.name] }
        }
      }
    }

    return repoData
  })

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const githubData = await getGitHubRepoInfo()
    return { githubData }
  },
  head: () => ({
    meta: [
      {
        title: 'Quinn Sprouse - Product Engineer & Software Developer'
      },
      {
        name: 'description',
        content: 'Product engineer focused on thoughtful digital experiences. Building tools for study, focus, and personal growth. View my portfolio and latest projects.'
      },
      {
        name: 'keywords',
        content: 'Quinn Sprouse, software engineer, product engineer, full-stack developer, React, TypeScript, portfolio'
      },
      {
        property: 'og:title',
        content: 'Quinn Sprouse - Product Engineer & Software Developer'
      },
      {
        property: 'og:description',
        content: 'Product engineer focused on thoughtful digital experiences. Building tools for study, focus, and personal growth.'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:url',
        content: 'https://quinnsprouse.com'
      },
      {
        property: 'og:site_name',
        content: 'Quinn Sprouse Portfolio'
      },
      {
        name: 'twitter:card',
        content: 'summary'
      },
      {
        name: 'twitter:title',
        content: 'Quinn Sprouse - Product Engineer & Software Developer'
      },
      {
        name: 'twitter:description',
        content: 'Product engineer focused on thoughtful digital experiences. Building tools for study, focus, and personal growth.'
      },
      {
        name: 'author',
        content: 'Quinn Sprouse'
      },
      {
        name: 'robots',
        content: 'index, follow'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      }
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://quinnsprouse.com'
      }
    ]
  })
})

interface Project {
  title: string
  description: string
  link: string
  year: string
  status?: 'active' | 'archived'
  repoKey?: string
}

interface Experience {
  role: string
  company: string
  period: string
}

const projects: Project[] = [
  {
    title: 'Lumina Bible',
    description: 'Deep study companion for scripture exploration',
    link: 'https://luminabible.app',
    year: '2024',
    status: 'active',
    repoKey: 'bible-app',
  },
  {
    title: 'Pocket GR',
    description: 'Photography space for quiet travel moments',
    link: 'https://pocketgr.com',
    year: '2024',
    status: 'active',
    repoKey: 'personal-photo-blog',
  },
  {
    title: 'Workit',
    description: 'Focused workout companion for habit building',
    link: 'https://workit-three.vercel.app',
    year: '2023',
    status: 'archived',
    repoKey: 'workit',
  },
]

const experience: Experience[] = [
  {
    role: 'SDET',
    company: 'Redi.Health',
    period: '2024—Present',
  },
  {
    role: 'Software Engineer',
    company: 'MedInformatix',
    period: '2023—2024',
  },
  {
    role: 'Software Engineer',
    company: 'The SOAR Initiative',
    period: '2023—2024',
  },
  {
    role: 'Frontend Engineer',
    company: 'Aware (Mimecast)',
    period: '2021—2023',
  },
  {
    role: 'QA Engineer',
    company: 'Aware',
    period: '2020—2021',
  },
]

function Home() {
  const { githubData } = Route.useLoaderData()

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Quinn Sprouse",
    "jobTitle": "Product Engineer",
    "description": "Product engineer focused on thoughtful digital experiences. Building tools for study, focus, and personal growth.",
    "url": "https://quinnsprouse.com",
    "sameAs": [
      "https://github.com/quinnsprouse",
      "https://linkedin.com/in/quinnsprouse"
    ],
    "email": "hello@quinnsprouse.com",
    "worksFor": {
      "@type": "Organization",
      "name": "Redi.Health"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>Quinn Sprouse</h1>
          <p className="text-base text-muted-foreground leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Product engineer focused on thoughtful digital experiences.
            Currently building tools for study, focus, and personal growth.
          </p>
        </header>

        {/* Projects */}
        <section className="mb-16">
          <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>Selected Work</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-start justify-between py-2 border-b border-border/20 hover:border-border/40 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {project.title}
                      </span>
                      <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {project.year}
                    </span>
                    <span
                      className={`relative group/status inline-block size-1.5 rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-muted-foreground/30'
                      }`}
                      aria-label={project.status === 'active' ? 'Active development' : 'Archived'}
                    >
                      <span className="absolute bottom-full right-0 mb-2 hidden group-hover/status:block whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background">
                        <div className="font-mono">{project.status === 'active' ? 'Active development' : 'Archived'}</div>
                        {project.repoKey && githubData[project.repoKey]?.lastUpdated && (
                          <div className="mt-0.5 font-mono text-[10px] opacity-70">
                            Last updated: {githubData[project.repoKey].lastUpdated}
                          </div>
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="mb-16">
          <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>Experience</h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.company} className="flex justify-between items-start py-2">
                <div>
                  <p className="text-base font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{exp.role}</p>
                  <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>{exp.company}</p>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {exp.period}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>Contact</h2>
          <div className="space-y-2">
            <a
              href="mailto:hello@quinnsprouse.com"
              className="block text-sm hover:text-primary transition-colors font-mono"
            >
              hello@quinnsprouse.com
            </a>
            <a
              href="https://github.com/quinnsprouse"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm hover:text-primary transition-colors font-mono"
            >
              github.com/quinnsprouse
            </a>
            <a
              href="https://linkedin.com/in/quinnsprouse"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm hover:text-primary transition-colors font-mono"
            >
              linkedin.com/in/quinnsprouse
            </a>
          </div>
        </section>

        {/* Writing */}
        <section className="mb-16">
          <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>Writing</h2>
          <Link
            to="/blog"
            className="block text-base hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View blog →
          </Link>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/20">
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} Quinn Sprouse
          </p>
        </footer>
      </div>
    </div>
  )
}