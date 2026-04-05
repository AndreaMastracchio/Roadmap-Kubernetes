import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 3000,
    fs: {
      // Permetti accesso ai file fuori dalla root del frontend
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@modules': path.resolve(__dirname, '../project_public/k8s-fondamentali')
    }
  }
})
