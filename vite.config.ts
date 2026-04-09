import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { paraglideVitePlugin } from '@inlang/paraglide-js'

const config = defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        // Explicit per-route patterns enable typesafe translated pathnames
        // and ensure prerendering generates both /... and /bg/... variants.
        // English is the base locale (no prefix); Bulgarian gets /bg/ prefix.
        { pattern: '/', localized: [['en', '/'], ['bg', '/bg']] },
        { pattern: '/about', localized: [['en', '/about'], ['bg', '/bg/about']] },
        { pattern: '/projects', localized: [['en', '/projects'], ['bg', '/bg/projects']] },
        { pattern: '/uses', localized: [['en', '/uses'], ['bg', '/bg/uses']] },
        { pattern: '/contact', localized: [['en', '/contact'], ['bg', '/bg/contact']] },
        { pattern: '/blog', localized: [['en', '/blog'], ['bg', '/bg/blog']] },
        { pattern: '/blog/:slug', localized: [['en', '/blog/:slug'], ['bg', '/bg/blog/:slug']] },
        // Wildcard fallback for any unlisted routes
        { pattern: '/:path(.*)?', localized: [['en', '/:path(.*)?'], ['bg', '/bg/:path(.*)?']] },
      ],
    }),
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        filter: ({ path }) => !path.startsWith('/admin') && !path.startsWith('/api'),
      },
    }),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    }),
  ],
})

export default config
