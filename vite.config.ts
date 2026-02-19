import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: '.output',
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Inline small assets to reduce requests
    assetsInlineLimit: 4096,
    rollupOptions: {
      onwarn(warning, warn) {
        const warningFromTanStackStartDependency =
          warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
          typeof warning.id === 'string' &&
          warning.id.includes('node_modules/@tanstack/start-')

        if (warningFromTanStackStartDependency) {
          return
        }

        warn(warning)
      },
    },
  },
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        mdExtensions: ['.md', '.mdx'],
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
          remarkGfm,
        ],
        providerImportSource: '@mdx-js/react',
      }),
    },
    tsConfigPaths(),
    tanstackStart(),
    nitro({ preset: 'vercel' }),
    viteReact({
      include: /\.(mdx|md|jsx|js|tsx|ts)$/,
    }),
    tailwindcss(),
    // Enable gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Enable brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
})
