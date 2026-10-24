import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Output to /dist at the project root — the Express server looks here
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    proxy: {
      // Dev only: forward /api/* and /uploads/* to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
