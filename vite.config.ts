import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Served from GitHub Pages under /HighDice/, so the base path must match the repo name.
export default defineConfig({
  base: '/HighDice/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
