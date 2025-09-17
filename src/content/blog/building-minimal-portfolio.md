---
title: Building a Minimal Portfolio with TanStack Start
description: How I built this portfolio using modern web technologies while keeping it simple and fast
date: 2024-12-18
readingTime: 3 min
---

When building a portfolio site, it's easy to over-engineer. You start with a simple idea, then add animations, complex layouts, and before you know it, you've built something that takes seconds to load and is hard to maintain.

I wanted something different. Something that loads instantly, looks clean, and focuses on the content.

## The Stack

This portfolio is built with [TanStack Start](https://tanstack.com/start), a full-stack React framework with file-based routing and server-side rendering. For styling, I'm using [Tailwind CSS v4](https://tailwindcss.com) and [Shadcn/ui](https://ui.shadcn.com) components.

The entire site is written in [TypeScript](https://www.typescriptlang.org) and built with [Vite](https://vitejs.dev). Blog posts are simple markdown files, parsed with [gray-matter](https://github.com/jonschlinkert/gray-matter) and rendered using [react-markdown](https://github.com/remarkjs/react-markdown).

## Typography

After starting with monospace fonts, I moved to a three-font system: [Crimson Pro](https://fonts.google.com/specimen/Crimson+Pro) for headings and blog content, [Inter](https://fonts.google.com/specimen/Inter) for UI text, and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for dates and code.

## Performance

The site scores 100 across all Lighthouse metrics. Server-side rendering ensures instant initial paint, and optimized font loading keeps things fast.

## What's Next

I plan to write more about building products and technical challenges. The system is simple enough for plain markdown but can handle more complex content when needed.

Sometimes the best solution is the simplest one.