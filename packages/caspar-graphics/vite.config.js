import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import paths from './src/node/paths'

export default defineConfig({
  root: paths.ownClientSrc,
  build: {
    outDir: paths.ownClientDist,
    emptyOutDir: true,
  },
  server: {
    open: false,
  },
  plugins: [react(), vue()],
})
