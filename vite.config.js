import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/lookalike': 'http://localhost:8000',
      '/vector': 'http://localhost:8000',
      '/top_looklikeable': 'http://localhost:8000'
    }
  }
})