import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    svgr({
      include: ['src/**/*.svg']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    open: true,
    port: 5173,
    fs: {
      strict: true,
      allow: ['..']
    }
  },
  build: {
    outDir: 'build'
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  assetsInclude: ['**/*.svg']
})
