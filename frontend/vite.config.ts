import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function museumStaticPaths() {
  const mount: import('vite').Connect.NextHandleFunction = (req, _res, next) => {
    if (req.url?.startsWith('/_next/static/')) req.url = '/living-museum-experience' + req.url
    next()
  }
  return {
    name: 'museum-static-paths',
    configureServer(server: import('vite').ViteDevServer) { server.middlewares.use(mount) },
    configurePreviewServer(server: import('vite').PreviewServer) { server.middlewares.use(mount) },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [museumStaticPaths(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
