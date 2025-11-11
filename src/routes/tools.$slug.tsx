import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'

import {
  toolComponents,
  getToolBySlug,
} from '@/components/tools/registry'
import { getToolAccessFn } from '@/server/tools/auth'

export const Route = createFileRoute('/tools/$slug')({
  beforeLoad: async ({ location }) => {
    const access = await getToolAccessFn()

    if (!access.hasToolAccess) {
      throw redirect({
        to: '/tools/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  loader: ({ params }) => {
    const tool = getToolBySlug(params.slug)

    if (!tool) {
      throw redirect({ to: '/tools' })
    }

    return tool
  },
  head: ({ loaderData }) => {
    const title = loaderData?.name
      ? `${loaderData.name} · Tools`
      : 'Tool'
    const description =
      loaderData?.description ??
      'Secret tool available on Quinn Sprouse’s site.'

    return {
      meta: [
        { title },
        {
          name: 'description',
          content: description,
        },
      ],
    }
  },
  component: ToolRouteComponent,
})

function ToolRouteComponent() {
  const router = useRouter()
  const tool = Route.useLoaderData()
  const ToolComponent = toolComponents[tool.slug]

  if (!ToolComponent) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-24 text-foreground">
        <div className="space-y-6">
          <p className="text-sm font-mono uppercase tracking-[0.3em] text-muted-foreground">
            Missing tool
          </p>
          <p className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
            “{tool.name}” doesn’t have an implementation yet.
          </p>
          <button
            onClick={() => router.navigate({ to: '/tools' })}
            className="inline-flex items-center rounded-md border border-border/60 px-4 py-2 text-xs font-mono uppercase tracking-[0.35em]"
          >
            Back to list
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-24 text-foreground">
      <Link
        to="/tools"
        className="mb-8 inline-flex items-center text-sm font-mono text-muted-foreground transition hover:text-foreground"
      >
        ← Back to tools
      </Link>

      <section className="space-y-8">
        <header className="space-y-4">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
            {tool.badge ? `${tool.badge} tool` : 'Micro tool'}
          </p>
          <div>
            <h1
              className="text-4xl font-light"
              style={{ fontFamily: 'Crimson Pro, serif' }}
            >
              {tool.name}
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </header>

        <ToolComponent />
        <div>
          <Link
            to="/tools"
            className="inline-flex items-center text-sm font-mono text-muted-foreground transition hover:text-foreground"
          >
            ← Return to index
          </Link>
        </div>
      </section>
    </main>
  )
}
