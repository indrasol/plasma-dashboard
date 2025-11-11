import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/lookalike': 'http://localhost:8000',
      '/vector': 'http://localhost:8000',
      '/top_looklikeable': 'http://localhost:8000'
    }
  }
})

