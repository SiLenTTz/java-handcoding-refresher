import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { javaRunnerPlugin } from './server/javaRunnerPlugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), javaRunnerPlugin()],
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 4173 },
})
