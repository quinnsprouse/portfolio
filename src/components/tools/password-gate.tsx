import { useId, useState, type FormEvent } from 'react'

import { Icon, ViewIcon, ViewOffIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type PasswordGateFormProps = {
  onSubmit: (password: string) => Promise<void> | void
  isSubmitting?: boolean
  error?: string | null
  className?: string
}

export function PasswordGateForm({
  onSubmit,
  isSubmitting,
  error,
  className,
}: PasswordGateFormProps) {
  const fieldId = useId()
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(password)
  }

  return (
    <form
      className={cn('space-y-5', className)}
      onSubmit={handleSubmit}
    >
      <label className="block space-y-2" htmlFor={fieldId}>
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Access key
        </span>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              id={fieldId}
              name="password"
              type={isVisible ? 'text' : 'password'}
              placeholder="••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-border/50 bg-background/60 px-4 py-3 pr-16 font-mono text-base tracking-tight text-foreground transition focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/40"
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
            <button
              type="button"
              onClick={() => setIsVisible((state) => !state)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground transition hover:text-foreground"
              tabIndex={-1}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
            >
              {isVisible ? <Icon icon={ViewOffIcon} className="h-4 w-4" aria-hidden="true" /> : <Icon icon={ViewIcon} className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-[52px] items-center gap-2 rounded-md border border-border/60 px-5 text-xs font-mono uppercase tracking-[0.35em] text-foreground transition hover:bg-foreground hover:text-background disabled:opacity-60"
          >
            {isSubmitting ? '…' : 'Unlock'}
          </button>
        </div>
      </label>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : null}
    </form>
  )
}
