# Quinn Sprouse Portfolio

A modern personal portfolio built with TanStack Start (full-stack React), Shadcn/ui, Tailwind CSS v4, and TypeScript. Fork or clone this repo to kickstart your own fast, SSR-ready portfolio with opinionated styling and content patterns.

## Features
- File-based routing via TanStack Start with co-located loaders and server functions
- Shadcn/ui component library styled through Tailwind CSS v4 and OKLCH design tokens
- Markdown-powered blog posts sourced from `src/content`
- GitHub activity section with optional API integration
- Password-gated “secret tools” area powered by TanStack Start server functions
- Production build optimized with Vite and tree-shaken React 19

## Quick Start
1. Ensure Node.js 18+ and npm are installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the dev server at http://localhost:3000 with hot reload and SSR:
   ```bash
   npm run dev
   ```

## Environment Variables
Set these in a `.env` file or your shell before running the app:
- `GITHUB_TOKEN` (server) or `VITE_GITHUB_TOKEN` (client fallback): enables GitHub REST + GraphQL requests for repo metadata and contribution heatmaps. Omit to use the built-in fallback data.
- `TOOLS_SESSION_SECRET`: 32+ character random string used to encrypt the tools session cookie.
- `TOOLS_PASSWORD_HASH`: SHA-256 hash of your personal access password (defaults to the bundled example hash).
- `TOOLS_SESSION_NAME` (optional): customize the cookie name, defaults to `tool-session`.
- `TOOLS_SESSION_VERSION` (optional): bump to invalidate all existing sessions (defaults to `1`).

An `.env.example` file is included with sane defaults. To rotate the password hash, run:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('your-new-password').digest('hex'))"
```

## Secret Micro Tools

- Visit `/tools/login` and enter the password you configured to unlock the session.
- Once authenticated, `/tools/` lists every available tool and gives you a one-click lock button that clears the session cookie.
- Individual tools (e.g. `/tools/randomizer`) are still protected because each route calls the same server-side access check inside `beforeLoad`.
- No database is required—access state lives inside a signed, HTTP-only session cookie configured via `useToolSession` in `src/server/tools/session.ts`.

## Project Structure
- `src/routes` — TanStack Start route files; each exports `createFileRoute`
- `src/components` — UI building blocks and feature composites (`ui/` holds Shadcn primitives)
- `src/content` — Markdown posts with frontmatter consumed by blog routes
- `src/lib` — Utilities such as GitHub fetch helpers and Tailwind class utilities
- `src/styles/app.css` — Tailwind setup, design tokens, and global styles
- `src/routeTree.gen.ts` — auto-generated route manifest (do not edit)

## Customization Guide
- Update hero copy, projects, and experience data inside `src/routes/index.tsx`
- Add or edit blog posts by creating new Markdown files in `src/content`
- Extend Shadcn components or create new variants in `src/components/ui`
- Adjust styling tokens or fonts in `src/styles/app.css`; rely on `bg-background`, `text-foreground`, etc. for theme parity

## Build & Deploy
- Build for production:
  ```bash
  npm run build
  ```
- Preview the built output locally:
  ```bash
  npm run start
  ```
Deploy the `dist/` output to platforms like Vercel, Netlify, or any static host with Node SSR support. Ensure the GitHub token is injected as an environment variable in your hosting dashboard.

## License
Private — contact Quinn Sprouse for reuse permissions beyond personal experimentation.
