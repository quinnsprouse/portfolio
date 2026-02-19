# Agent Instructions

This is a TanStack Start + React 19 TypeScript portfolio app with shadcn/ui, Tailwind v4, MDX content, and Vite.

- Package manager: `npm`
- Core commands:
  - `npm run check` (strict lint + typecheck + unit tests)
  - `npm run check:push` (`check` + Playwright smoke test)
  - `npm run build` (typecheck + production build)
  - `npm run dev` (local dev server at `http://localhost:3000`)

## Plan Loop

Use this loop for non-trivial work:

1. Plan
2. Execute
3. Test
4. Commit

## Project Rules

- Treat `src/routeTree.gen.ts` as generated/read-only.
- Keep server-only fetch/secrets in `createServerFn` handlers.
- Build UI from `src/components/ui` primitives and compose classes with `cn`.
- Keep blog content in `src/content` with slug/filename parity.
