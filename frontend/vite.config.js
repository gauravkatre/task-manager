import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'gallant-illumination-production.up.railway.app',
      'all'
    ],
    port: 8080,
    host: true,
  }
})