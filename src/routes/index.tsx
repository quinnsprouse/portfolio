import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { ArrowUpRight } from 'lucide-react'

import { CardStack } from '@/components/card-stack'
import { GithubContributions } from '@/components/github-contributions'
import { defaultContributionColors } from '@/lib/github'
import type { ContributionCalendar, ContributionDay, ContributionWeek } from '@/lib/github'
import { ComesInGoesOutUnderline } from '@/components/underline/comes-in-goes-out-underline'
import { GoesOutComesInUnderline } from '@/components/underline/goes-out-comes-in-underline'

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

const resolveGitHubToken = () => {
  const env = typeof process !== 'undefined' ? process.env : undefined

  return env?.GITHUB_TOKEN
    ?? env?.VITE_GITHUB_TOKEN
    ?? undefined
}

const normalizeContributionColors = (colors: string[]) =>
  Array.from({ length: 5 }, (_, index) => colors[index] ?? defaultContributionColors[index])

const MOBILE_WEEKS = 26

const buildContributionCalendar = (
  weeks: ContributionWeek[],
  colors: string[],
  totalContributions?: number
): ContributionCalendar => {
  const normalizedColors = normalizeContributionColors(colors)
  const weekLabels: string[] = []
  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
  let lastMonth = -1
  let lastYear = -1

  weeks.forEach((week, weekIndex) => {
    const firstActiveDay = week.find((day) => day !== null)

    if (!firstActiveDay) {
      weekLabels.push('')
      return
    }

    const date = new Date(firstActiveDay.date)
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()

    // Show label only on first occurrence of a new month
    if (currentMonth !== lastMonth || currentYear !== lastYear) {
      // Check if the first day of this week is early enough in the month (day 1-14)
      // GitHub only shows month labels when there's enough space
      const firstDayOfWeek = new Date(firstActiveDay.date)
      const dayOfMonth = firstDayOfWeek.getDate()

      // Skip label for the very first week if it's a partial week (< 7 days)
      // This prevents showing labels when the year starts mid-week
      if (weekIndex === 0 && week.length < 7) {
        weekLabels.push('')
      } else if (dayOfMonth <= 14) {
        weekLabels.push(monthFormatter.format(date))
        lastMonth = currentMonth
        lastYear = currentYear
      } else {
        weekLabels.push('')
      }
    } else {
      weekLabels.push('')
    }
  })

  return {
    weeks,
    weekLabels,
    totalContributions,
    levelColors: normalizedColors,
    recentWeeks: weeks.slice(-MOBILE_WEEKS),
    recentWeekLabels: weekLabels.slice(-MOBILE_WEEKS),
  }
}

const getGitHubContributionCalendar = createServerFn({ method: 'GET' })
  .handler(async () => {
    const username = 'quinnsprouse'
    const token = resolveGitHubToken()

    if (token) {
      try {
        // Set 'to' to end of today
        const to = new Date()
        to.setHours(23, 59, 59, 999)

        // Set 'from' to exactly 365 days ago from today
        const from = new Date(to)
        from.setDate(from.getDate() - 364) // 364 days ago + today = 365 days total
        from.setHours(0, 0, 0, 0)

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Portfolio-Website',
          },
          body: JSON.stringify({
            query: `
              query ($login: String!, $from: DateTime!, $to: DateTime!) {
                user(login: $login) {
                  contributionsCollection(from: $from, to: $to) {
                    contributionCalendar {
                      totalContributions
                      colors
                      weeks {
                        contributionDays {
                          date
                          color
                          contributionCount
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: {
              login: username,
              from: from.toISOString(),
              to: to.toISOString(),
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`GitHub GraphQL request failed: ${response.status}`)
        }

        const graphResult = await response.json() as {
          data?: {
            user?: {
              contributionsCollection?: {
                contributionCalendar?: {
                  totalContributions?: number
                  colors?: string[]
                  weeks: {
                    contributionDays: Array<{
                      date: string
                      color: string
                      contributionCount: number
                    }>
                  }[]
                }
              }
            }
          }
          errors?: Array<{ message: string }>
        }

        if (graphResult.errors?.length) {
          const aggregated = graphResult.errors.map((err) => err.message).join('; ')
          throw new Error(`GitHub GraphQL errors: ${aggregated}`)
        }

        const calendarData = graphResult.data?.user?.contributionsCollection?.contributionCalendar

        if (calendarData) {
          const colors = normalizeContributionColors(calendarData.colors ?? [])
          const today = new Date()
          today.setHours(23, 59, 59, 999)

          // Create a map of all contribution days
          const dayMap = new Map<string, ContributionDay>()

          for (const week of calendarData.weeks) {
            for (const day of week.contributionDays) {
              const dayDate = new Date(day.date)
              dayDate.setHours(0, 0, 0, 0)

              // Skip future dates
              if (dayDate > today) {
                continue
              }

              const levelIndex = colors.indexOf(day.color)
              dayMap.set(day.date, {
                date: day.date,
                count: day.contributionCount,
                level: levelIndex >= 0 ? levelIndex : 0,
                fill: day.color,
              })
            }
          }

          // Find the date range
          const sortedDates = Array.from(dayMap.keys()).sort()
          if (sortedDates.length === 0) {
            return null
          }

          const firstDate = new Date(sortedDates[0]!)
          const lastDate = new Date(sortedDates[sortedDates.length - 1]!)

          // Cap at today
          const effectiveLastDate = lastDate > today ? today : lastDate

          // Find the Sunday of the week containing firstDate
          // getDay() returns 0 for Sunday, 1 for Monday, etc.
          const startDate = new Date(firstDate)
          const dayOfWeek = startDate.getDay()
          startDate.setDate(startDate.getDate() - dayOfWeek) // Go back to Sunday

          // Build weeks: each week is [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
          const weeks: ContributionWeek[] = []
          let currentWeek: ContributionWeek = []

          for (
            let cursor = new Date(startDate);
            cursor <= effectiveLastDate;
            cursor.setDate(cursor.getDate() + 1)
          ) {
            const isoDate = cursor.toISOString().split('T')[0]!
            const contributionDay = dayMap.get(isoDate) ?? null

            currentWeek.push(contributionDay)

            // If we've filled 7 days (Sun-Sat), start a new week
            if (currentWeek.length === 7) {
              weeks.push(currentWeek)
              currentWeek = []
            }
          }

          // Add any remaining partial week
          if (currentWeek.length > 0) {
            // Pad with nulls to make it 7 days
            while (currentWeek.length < 7) {
              currentWeek.push(null)
            }
            weeks.push(currentWeek)
          }

          return buildContributionCalendar(weeks, colors, calendarData.totalContributions)
        }
      } catch (error) {
        console.error('Failed to fetch GitHub contributions via GraphQL:', error)
      }
    }

    try {
      const response = await fetch('https://github.com/users/quinnsprouse/contributions', {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub contributions request failed: ${response.status}`)
      }

      const html = await response.text()
      const rectMatches = html.match(/<rect[^>]*>/g) ?? []

      const dayMap = new Map<string, ContributionDay>()
      const levelColors: Record<number, string> = {}

      for (const rect of rectMatches) {
        const attributes: Record<string, string> = {}
        const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)="([^"]*)"/g
        let attrMatch: RegExpExecArray | null

        while ((attrMatch = attrRegex.exec(rect)) !== null) {
          const [, key, value] = attrMatch
          attributes[key] = value
        }

        const date = attributes['data-date']

        if (!date) {
          continue
        }

        const count = Number.parseInt(attributes['data-count'] ?? '0', 10)
        const level = Number.parseInt(attributes['data-level'] ?? '0', 10)
        const fill = attributes['fill']

        if (Number.isFinite(level) && fill && levelColors[level] === undefined) {
          levelColors[level] = fill
        }

        dayMap.set(date, {
          date,
          count: Number.isFinite(count) ? count : 0,
          level: Number.isFinite(level) ? level : 0,
          fill,
        })
      }

      if (dayMap.size === 0) {
        throw new Error('No contribution data parsed from GitHub response')
      }

      const sortedDates = Array.from(dayMap.keys()).sort()
      if (sortedDates.length === 0) {
        throw new Error('No contribution data parsed from GitHub response')
      }

      const firstDate = new Date(sortedDates[0]!)
      const lastDate = new Date(sortedDates[sortedDates.length - 1]!)

      // Don't show future dates - cap at today
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const effectiveLastDate = lastDate > today ? today : lastDate

      // Find the Sunday of the week containing firstDate
      // getDay() returns 0 for Sunday, 1 for Monday, etc.
      const startDate = new Date(firstDate)
      const dayOfWeek = startDate.getDay()
      startDate.setDate(startDate.getDate() - dayOfWeek) // Go back to Sunday

      // Build weeks: each week is [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
      const weeks: ContributionWeek[] = []
      let currentWeek: ContributionWeek = []

      for (
        let cursor = new Date(startDate);
        cursor <= effectiveLastDate;
        cursor.setDate(cursor.getDate() + 1)
      ) {
        const isoDate = cursor.toISOString().split('T')[0]!
        const contributionDay = dayMap.get(isoDate) ?? null

        currentWeek.push(contributionDay)

        // If we've filled 7 days (Sun-Sat), start a new week
        if (currentWeek.length === 7) {
          weeks.push(currentWeek)
          currentWeek = []
        }
      }

      // Add any remaining partial week
      if (currentWeek.length > 0) {
        // Pad with nulls to make it 7 days
        while (currentWeek.length < 7) {
          currentWeek.push(null)
        }
        weeks.push(currentWeek)
      }

      const totalMatch = html.match(/([0-9,]+) contributions in the last year/i)
      const totalContributions = totalMatch ? Number.parseInt(totalMatch[1]!.replace(/,/g, ''), 10) : undefined

      const colors = normalizeContributionColors(
        Array.from({ length: 5 }, (_, index) => levelColors[index] ?? defaultContributionColors[index])
      )

      return buildContributionCalendar(weeks, colors, totalContributions)
    } catch (error) {
      console.error('Failed to fetch GitHub contributions via HTML:', error)
      return null
    }
  })

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const [githubData, githubCalendar] = await Promise.all([
      getGitHubRepoInfo(),
      getGitHubContributionCalendar(),
    ])

    return { githubData, githubCalendar }
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
        property: 'og:image',
        content: 'https://quinnsprouse.com/og-image.png'
      },
      {
        property: 'og:image:width',
        content: '1200'
      },
      {
        property: 'og:image:height',
        content: '630'
      },
      {
        property: 'og:image:alt',
        content: 'Quinn Sprouse - Product Engineer & Software Developer'
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:image',
        content: 'https://quinnsprouse.com/og-image.png'
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
  const { githubData, githubCalendar } = Route.useLoaderData()

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
      "https://www.linkedin.com/",
      "https://x.com/QuinnSprouse"
    ],
    "email": "quinnsprouse@gmail.com",
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
      <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24 lg:px-16">
        {/* Header */}
        <header className="mb-16">
          <div className="grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,360px)] md:items-center lg:gap-20">
            <div className="md:flex md:flex-col md:justify-center">
              <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>Quinn Sprouse</h1>
              <p className="text-base text-muted-foreground leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Product engineer focused on thoughtful digital experiences—currently working from Columbus, Ohio and
                shaping tools that feel calm, tactile, and purposeful. Most days are spent iterating on{' '}
                <a
                  href="https://luminabible.app"
                  className="underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  Lumina Bible
                </a>{' '}
                while documenting the journey in{' '}
                <Link
                  to="/blog"
                  className="underline decoration-dotted underline-offset-4 transition-colors hover:text-primary"
                >
                  long-form notes
                </Link>
                .
              </p>
          </div>
            <div className="flex justify-center md:justify-end md:pl-10 lg:pl-16">
              <CardStack />
            </div>
          </div>
        </header>

        {/* Projects */}
        <section className="mb-16">
          <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>Selected Work</h2>
          <div className="space-y-4">
            {projects.map((project) => {
              const lastUpdated = project.repoKey
                ? githubData[project.repoKey]?.lastUpdated
                : undefined
              const parsedLastUpdated = lastUpdated ? Date.parse(lastUpdated) : NaN
              const displayYear = Number.isNaN(parsedLastUpdated)
                ? project.year
                : new Date(parsedLastUpdated).getFullYear().toString()

              return (
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
                        {displayYear}
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
                          {lastUpdated && (
                            <div className="mt-0.5 font-mono text-[10px] opacity-70">
                              Last updated: {lastUpdated}
                            </div>
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>GitHub Activity</h2>
          {githubCalendar ? (
            <GithubContributions calendar={githubCalendar} />
          ) : (
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
              Unable to load contributions right now. If you are developing locally, set a `GITHUB_TOKEN` environment
              variable with access to the GitHub GraphQL API or check your network connection, then refresh.
            </p>
          )}
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
          <div className="flex flex-col items-start space-y-2">
            <ComesInGoesOutUnderline
              as="a"
              href="mailto:quinnsprouse@gmail.com"
              className="inline-flex text-start font-mono text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              direction="left"
            >
              quinnsprouse@gmail.com
            </ComesInGoesOutUnderline>
            <ComesInGoesOutUnderline
              as="a"
              href="https://github.com/quinnsprouse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-start font-mono text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              direction="right"
            >
              github.com/quinnsprouse
            </ComesInGoesOutUnderline>
            <ComesInGoesOutUnderline
              as="a"
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-start font-mono text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              direction="left"
            >
              linkedin.com
            </ComesInGoesOutUnderline>
            <ComesInGoesOutUnderline
              as="a"
              href="https://x.com/QuinnSprouse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-start font-mono text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              direction="right"
            >
              x.com/QuinnSprouse
            </ComesInGoesOutUnderline>
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
