import { useMemo, useState } from 'react'

const prompts = [
  'Draft a thank-you note that name-drops a niche React hook.',
  'Invent a product tagline using only emojis.',
  'Summarize today’s focus as if you were a space mission control lead.',
  'Describe your current bug in the style of a dinner recipe.',
  'Pitch a fake YC startup that solves meetings forever.',
  'Write a haiku about the feature you keep postponing.',
  'Define success for the next hour in under seven words.',
]

function getRandomPrompt(exclude?: string) {
  const available = prompts.filter((prompt) => prompt !== exclude)
  const list = available.length > 0 ? available : prompts
  const index = Math.floor(Math.random() * list.length)
  return list[index] ?? prompts[0]!
}

export function RandomizerTool() {
  const initialPrompt = useMemo(() => getRandomPrompt(), [])
  const [prompt, setPrompt] = useState(initialPrompt)

  function handleShuffle() {
    setPrompt(getRandomPrompt(prompt))
  }

  return (
    <section className="space-y-6 rounded-2xl border border-border/50 bg-background/60 p-6">
      <header>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
          Idea randomizer
        </p>
        <p
          className="mt-2 text-sm text-muted-foreground"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Tap for a playful prompt whenever you need a creative derailment.
        </p>
      </header>

      <blockquote
        className="rounded-xl border border-border/40 bg-background/80 p-6 text-2xl font-light leading-relaxed text-foreground"
        style={{ fontFamily: 'Crimson Pro, serif' }}
        aria-live="polite"
        aria-atomic="true"
      >
        {prompt}
      </blockquote>

      <button
        onClick={handleShuffle}
        className="inline-flex items-center gap-2 rounded-md border border-border/60 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Shuffle prompt
      </button>
    </section>
  )
}
