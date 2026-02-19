import { useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import { PasswordGateForm } from '@/components/tools/password-gate'
import { unlockToolsAreaFn, getToolAccessFn } from '@/server/tools/auth'
type ToolLoginSearch = {
  redirect?: string
}

export const Route = createFileRoute('/tools/login')({
  validateSearch: (search: ToolLoginSearch) => search ?? {},
  beforeLoad: async () => {
    const { hasToolAccess } = await getToolAccessFn()

    if (hasToolAccess) {
      throw redirect({ to: '/tools' })
    }
  },
  head: () => ({
    meta: [
      { title: 'Tool Access' },
      {
        name: 'description',
        content: 'Enter your private key to unlock the personal tools.',
      },
    ],
  }),
  component: ToolLoginRoute,
})

function ToolLoginRoute() {
  const router = useRouter()
  const { redirect: redirectAfterLogin } = Route.useSearch()
  const unlockToolsArea = useServerFn(unlockToolsAreaFn)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resolveDestination(raw?: string) {
    if (!raw) {
      return { to: '/tools' as const }
    }

    if (raw.startsWith('http') || raw.startsWith('//')) {
      return { to: '/tools' as const }
    }

    const normalized = raw.startsWith('/') ? raw : '/tools'

    if (normalized === '/tools' || normalized === '/tools/') {
      return { to: '/tools' as const }
    }

    if (normalized.startsWith('/tools/')) {
      const slug = normalized.slice('/tools/'.length).split('/')[0]

      if (slug) {
        return {
          to: '/tools/$slug' as const,
          params: { slug },
        }
      }
    }

    return { to: '/tools' as const }
  }

  async function handleUnlock(password: string) {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      const result = await unlockToolsArea({
        data: { password },
      })

      if (!result?.success) {
        setErrorMessage(result?.error ?? 'Unable to unlock right now.')
        return
      }

      await router.invalidate()

      await router.navigate(resolveDestination(redirectAfterLogin))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-6 py-24 text-foreground">
      <Link
        to="/"
        className="mb-10 inline-flex items-center text-sm font-mono text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
      >
        ← Back to site
      </Link>

      <div className="space-y-6">
        <PasswordGateForm
          onSubmit={handleUnlock}
          isSubmitting={isSubmitting}
          error={errorMessage}
        />
      </div>
    </main>
  )
}
