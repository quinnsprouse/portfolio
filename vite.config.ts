import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
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
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      customViteReactPlugin: true,
    }),
    viteReact(),
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