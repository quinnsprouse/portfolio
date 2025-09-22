/// <reference types="vite/client" />
import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface BlogPostData {
  title: string
  description: string
  date: string
  readingTime: string
  content: string
}

const getBlogPost = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const modules = import.meta.glob<string>(
      '../content/blog/*.{md,mdx}',
      {
        query: '?raw',
        import: 'default'
      }
    )

    const entry = Object.entries(modules).find(([filePath]) =>
      filePath.endsWith(`${slug}.mdx`) || filePath.endsWith(`${slug}.md`)
    )

    if (!entry) {
      console.error(`Blog post not found for slug: ${slug}`)
      throw new Error('Post not found')
    }

    const [filePath, loadContent] = entry

    try {
      const file = await loadContent()
      const { data, content } = matter(file)

      return {
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || '',
        readingTime: data.readingTime || '5 min',
        content
      } as BlogPostData
    } catch (error) {
      console.error(`Error loading blog post ${filePath}:`, error)
      throw new Error('Post not found')
    }
  })

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPost,
  loader: async ({ params }) => {
    if (!params.slug) {
      throw new Error('No slug provided')
    }
    const post = await getBlogPost({ data: params.slug })
    return { post }
  },
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: `${loaderData?.post.title} - Quinn Sprouse`
      },
      {
        name: 'description',
        content: loaderData?.post.description || 'Blog post by Quinn Sprouse'
      },
      {
        name: 'keywords',
        content: `${loaderData?.post.title}, Quinn Sprouse, software development, web development, programming`
      },
      {
        property: 'og:title',
        content: loaderData?.post.title || 'Blog Post'
      },
      {
        property: 'og:description',
        content: loaderData?.post.description || 'Blog post by Quinn Sprouse'
      },
      {
        property: 'og:type',
        content: 'article'
      },
      {
        property: 'og:url',
        content: `https://quinnsprouse.com/blog/${params.slug}`
      },
      {
        property: 'article:author',
        content: 'Quinn Sprouse'
      },
      {
        property: 'article:published_time',
        content: loaderData?.post.date
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: loaderData?.post.title || 'Blog Post'
      },
      {
        name: 'twitter:description',
        content: loaderData?.post.description || 'Blog post by Quinn Sprouse'
      },
      {
        name: 'robots',
        content: 'index, follow'
      }
    ],
    links: [
      {
        rel: 'canonical',
        href: `https://quinnsprouse.com/blog/${params.slug}`
      }
    ]
  })
})

function BlogPost() {
  const { post } = Route.useLoaderData()

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": "Quinn Sprouse",
      "url": "https://quinnsprouse.com"
    },
    "publisher": {
      "@type": "Person",
      "name": "Quinn Sprouse",
      "url": "https://quinnsprouse.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://quinnsprouse.com/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`
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
          <Link
            to="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-8 font-mono"
          >
            ← Back to blog
          </Link>
          <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>·</span>
            <span>{post.readingTime} read</span>
          </div>
        </header>

        {/* Content */}
        <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-light mt-12 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-light mt-10 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-light mt-8 mb-3" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-base leading-[1.8] mb-6" style={{ fontFamily: 'Crimson Pro, serif', fontSize: '19px' }}>
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-6 space-y-2 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-6 space-y-2 mb-6" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-base leading-[1.8]" style={{ fontSize: '19px' }}>
                  {children}
                </li>
              ),
              code: ({ inline, children }) => {
                if (inline) {
                  return (
                    <code className="px-1 py-0.5 bg-muted/50 rounded text-xs font-mono">
                      {children}
                    </code>
                  )
                }
                return (
                  <pre className="bg-muted/50 p-3 rounded overflow-x-auto mb-4">
                    <code className="text-xs font-mono">{children}</code>
                  </pre>
                )
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-muted-foreground/30 pl-6 italic mb-6" style={{ fontFamily: 'Crimson Pro, serif', fontSize: '19px', fontStyle: 'italic' }}>
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
