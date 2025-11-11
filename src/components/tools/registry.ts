import type { JSX } from 'react'
import { RandomizerTool } from './randomizer-tool'

export type MicroTool = {
  slug: string
  name: string
  description: string
  badge?: string
}

export const microTools: MicroTool[] = [
  {
    slug: 'randomizer',
    name: 'Idea Randomizer',
    description: 'Pulls a playful prompt when you need a creative nudge.',
    badge: 'beta',
  },
]

export const toolComponents: Record<string, () => JSX.Element> = {
  randomizer: RandomizerTool,
}

export function getToolBySlug(slug: string) {
  return microTools.find((tool) => tool.slug === slug)
}
