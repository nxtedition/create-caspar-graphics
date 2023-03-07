import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import paths from './src/node/paths'
import path from 'node:path'

export default defineConfig({
  root: paths.ownClientSrc,
  build: {
    outDir: paths.ownClientDist,
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'Caspar Graphics',
      fileName: 'caspar-graphics'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
        },
      },
    },
  },
  server: {
    open: false
  },
  plugins: [react()]
})
