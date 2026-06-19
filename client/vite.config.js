import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from the client directory
  const env = loadEnv(mode, process.cwd(), '')
  
  // Use VITE_DEV_API_URL if specified, otherwise fall back to localhost:5000
  const devApiTarget = env.VITE_DEV_API_URL || 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
