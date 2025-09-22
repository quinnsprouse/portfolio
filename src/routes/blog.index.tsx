/// <reference types="vite/client" />
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import matter from 'gray-matter'

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readingTime: string
}

const getBlogPosts = createServerFn({ method: 'GET' })
  .handler(async () => {
    const modules = import.meta.glob<string>(
      '../content/blog/*.{md,mdx}',
      {
        query: '?raw',
        import: 'default'
      }
    )

    const posts = await Promise.all(
      Object.entries(modules).map(async ([filePath, loadContent]) => {
        try {
          const file = await loadContent()
          const { data } = matter(file)
          const slug = filePath.split('/').pop()?.replace(/\.(mdx|md)$/i, '')

          if (!slug) {
            return null
          }

          return {
            slug,
            title: data.title || 'Untitled',
            description: data.description || '',
            date: data.date || '',
            readingTime: data.readingTime || '5 min'
          } as BlogPost
        } catch (error) {
          console.error(`Error loading blog post metadata from ${filePath}:`, error)
          return null
        }
      })
    )

    return posts
      .filter((post): post is BlogPost => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

export const Route = createFileRoute('/blog/')({
  component: Blog,
  loader: async () => {
    const posts = await getBlogPosts()
    return { posts }
  },
  head: () => ({
    meta: [
      {
        title: 'Blog - Quinn Sprouse | Writing on Software & Product Development'
      },
      {
        name: 'description',
        content: 'Thoughts on software development, design, and building products. Technical deep-dives, project retrospectives, and insights from a product engineer.'
      },
      {
        name: 'keywords',
        content: 'Quinn Sprouse blog, software development, product engineering, technical writing, React, TypeScript, web development'
      },
      {
        property: 'og:title',
        content: 'Blog - Quinn Sprouse'
      },
      {
        property: 'og:description',
        content: 'Thoughts on software development, design, and building products. Technical deep-dives and project retrospectives.'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        property: 'og:url',
        content: 'https://quinnsprouse.com/blog'
      },
      {
        name: 'twitter:card',
        content: 'summary'
      },
      {
        name: 'twitter:title',
        content: 'Blog - Quinn Sprouse'
      },
      {
        name: 'twitter:description',
        content: 'Thoughts on software development, design, and building products.'
      },
      {
        name: 'robots',
        content: 'index, follow'
      }
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://quinnsprouse.com/blog'
      }
    ]
  })
})

function Blog() {
  const { posts } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24 lg:px-16">
        {/* Header */}
        <header className="mb-16">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-8 font-mono"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>Writing</h1>
          <p className="text-base text-muted-foreground leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Thoughts on software development, design, and building products.
          </p>
        </header>

        {/* Posts */}
        <section>
          <div className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-base text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>No posts yet.</p>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.slug}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block group"
                >
                  <div className="flex items-start justify-between py-2 border-b border-border/20 hover:border-border/40 transition-colors">
                    <div className="flex-1">
                      <span className="text-base font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{post.title}</span>
                      {post.description && (
                        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {post.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm text-muted-foreground font-mono">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <footer className="mt-16 border-t border-border/20 pt-6">
          <p
            className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}
            aria-live="polite"
          >
            written by hand—never generated by ai.
          </p>
        </footer>
      </div>
    </div>
  )
}
