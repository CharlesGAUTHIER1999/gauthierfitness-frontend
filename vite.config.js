import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxie les fichiers storage du backend Laravel
      // pour éviter les erreurs CORS sur les images uploadées
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
