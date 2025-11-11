import { useMemo, useState } from 'react'
import {
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { Lock } from 'lucide-react'

import { ToolList } from '@/components/tools/tool-list'
import { microTools } from '@/components/tools/registry'
import {
  getToolAccessFn,
  lockToolsAreaFn,
} from '@/server/tools/auth'

export const Route = createFileRoute('/tools/')({
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

    return access
  },
  head: () => ({
    meta: [
      { title: 'Secret Tools' },
      {
        name: 'description',
        content: 'Launch Quinn’s private collection of personal tools.',
      },
    ],
  }),
  component: ToolsIndexRoute,
})

function ToolsIndexRoute() {
  const access = Route.useRouteContext()
  const router = useRouter()
  const lockToolsArea = useServerFn(lockToolsAreaFn)
  const [isLocking, setIsLocking] = useState(false)

  const unlockedCopy = useMemo(() => {
    if (!access.unlockedAt) {
      return 'Session active'
    }

    try {
      const ts = new Date(access.unlockedAt)
      return `Unlocked ${ts.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
      })}`
    } catch {
      return 'Session active'
    }
  }, [access.unlockedAt])

  const sessionExpiryCopy = useMemo(() => {
    if (!access.unlockedAt) {
      return null
    }

    try {
      const unlockedAt = new Date(access.unlockedAt).getTime()
      const expiresAt = unlockedAt + 12 * 60 * 60 * 1000
      const msRemaining = expiresAt - Date.now()

      if (msRemaining <= 0) {
        return 'Session expired'
      }

      const hours = Math.floor(msRemaining / (60 * 60 * 1000))
      const minutes = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000))

      if (hours <= 0) {
        return `Expires in ${minutes}m`
      }

      return `Expires in ${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
    } catch {
      return null
    }
  }, [access.unlockedAt])

  async function handleLock() {
    setIsLocking(true)
    try {
      await lockToolsArea()
      await router.invalidate()
      await router.navigate({ to: '/tools/login' })
    } finally {
      setIsLocking(false)
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-24 text-foreground">
      <header className="space-y-3 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1
            className="text-4xl font-light leading-tight"
            style={{ fontFamily: 'Crimson Pro, serif' }}
          >
            Tools
          </h1>
          <button
            onClick={handleLock}
            disabled={isLocking}
            className="inline-flex items-center gap-2 rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {isLocking ? 'Locking…' : 'Lock'}
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{unlockedCopy}</p>
          {sessionExpiryCopy ? (
            <p className="text-xs text-muted-foreground/80">{sessionExpiryCopy}</p>
          ) : null}
        </div>
      </header>

      <section className="mt-8">
        <ToolList tools={microTools} />
      </section>
    </main>
  )
}
