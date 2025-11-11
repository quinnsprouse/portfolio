import { Link } from '@tanstack/react-router'

import type { MicroTool } from './registry'

type ToolListProps = {
  tools: MicroTool[]
}

export function ToolList({ tools }: ToolListProps) {
  if (tools.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tools yet. Ship one when inspiration hits.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border/40 border-t border-border/40">
      {tools.map((tool) => (
        <li key={tool.slug} className="py-5">
          <Link
            to="/tools/$slug"
            params={{ slug: tool.slug }}
            className="group flex items-start justify-between gap-6 focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30"
          >
            <div>
              <p
                className="text-xl font-light text-foreground transition group-hover:text-foreground/90"
                style={{ fontFamily: 'Crimson Pro, serif' }}
              >
                {tool.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tool.description}
              </p>
            </div>
            <span className="text-lg text-muted-foreground transition group-hover:text-foreground">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
