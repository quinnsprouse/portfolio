/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import appCss from '@/styles/app.css?url'
import fontsCss from '@/styles/fonts.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Quinn Sprouse',
      },
    ],
    links: [
      {
        rel: 'preload',
        as: 'font',
        href: '/fonts/inter-400.ttf',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'font',
        href: '/fonts/crimson-pro-300.ttf',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical font-face declarations */
              @font-face {
                font-family: 'Inter';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url('/fonts/inter-400.ttf') format('truetype');
              }
              @font-face {
                font-family: 'Crimson Pro';
                font-style: normal;
                font-weight: 300;
                font-display: swap;
                src: url('/fonts/crimson-pro-300.ttf') format('truetype');
              }
              @font-face {
                font-family: 'JetBrains Mono';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url('/fonts/jetbrains-mono-400.ttf') format('truetype');
              }
            `,
          }}
        />
        <link
          rel="preload"
          href={fontsCss}
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link rel="stylesheet" href={fontsCss} />
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}
