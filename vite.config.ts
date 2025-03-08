import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    base: process.env.VITE_BASE_URL,
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
      port: parseInt(process.env.VITE_PORT || '5173'),
      fs: {
        strict: true,
        allow: ['..']
      }
    },
    build: {
      outDir: 'dist'
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    },
    assetsInclude: ['**/*.svg'],
    define: {
      'process.env': process.env
    }
  })
}
