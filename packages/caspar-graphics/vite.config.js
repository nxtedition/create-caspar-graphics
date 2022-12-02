import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import paths from './src/node/paths'

export default defineConfig({
  root: paths.ownClientSrc,
  build: {
    outDir: paths.ownClientDist,
    emptyOutDir: true
  },
  plugins: [react()]
})
