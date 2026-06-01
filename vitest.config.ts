import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // @vitejs/plugin-react@6 types its Plugin against vite 8, but vitest 3.2.4's
  // config types still expect vite ≤7 — a type-only version skew (runtime is fine).
  // Cast through `never` to bridge the divergent Plugin types.
  plugins: [viteReact() as never],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
