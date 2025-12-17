import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Keep legacy proxy paths if they are still used elsewhere, or remove if /api covers them
      // Assuming lookalike was moved to /api/lookalike
      '/lookalike': 'http://localhost:8000', 
    }
  }
})
