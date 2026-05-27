import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import rsc from '@vitejs/plugin-rsc'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['@tanstack/router-core'],
  },
  server: {
    sourcemapIgnoreList: (sourcePath) =>
      sourcePath.includes('node_modules'),
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        { pattern: '/', localized: [['en', '/'], ['bg', '/bg']] },
        { pattern: '/about', localized: [['en', '/about'], ['bg', '/bg/about']] },
        { pattern: '/projects', localized: [['en', '/projects'], ['bg', '/bg/projects']] },
        { pattern: '/uses', localized: [['en', '/uses'], ['bg', '/bg/uses']] },
        { pattern: '/contact', localized: [['en', '/contact'], ['bg', '/bg/contact']] },
        { pattern: '/blog', localized: [['en', '/blog'], ['bg', '/bg/blog']] },
        { pattern: '/blog/:slug', localized: [['en', '/blog/:slug'], ['bg', '/bg/blog/:slug']] },
        { pattern: '/:path(.*)?', localized: [['en', '/:path(.*)?'], ['bg', '/bg/:path(.*)?']] },
      ],
    }),
    devtools(),
    tailwindcss(),
    tanstackStart({
      rsc: {
        enabled: true,
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        filter: ({ path }) => !path.startsWith('/admin') && !path.startsWith('/api'),
      },
    }),
    rsc(),
    viteReact(),
  ],
})

export default config
