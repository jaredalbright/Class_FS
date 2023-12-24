import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base:'./',
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    port: 3000,
    host: true,
    strictPort: true
  }
})
