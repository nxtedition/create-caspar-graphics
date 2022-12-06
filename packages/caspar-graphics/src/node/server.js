import fs from 'node:fs'
import path from 'node:path'
import chokidar from 'chokidar'
import react from '@vitejs/plugin-react'
import getPort from 'get-port'
import { createServer as createViteServer, preview } from 'vite'
import paths from './paths.js'
import { WebSocketServer } from 'ws'

const watcher = chokidar.watch(
  paths.appTemplates + '/**/(index.html|manifest.json)',
  {
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  }
)

export async function createServer({ name, mode, host = 'localhost' }) {
  // Start a vite server for the user's templates.
  const templatesPort = await getPort()
  const templatesServer = await createViteServer({
    root: paths.appTemplates,
    clearScreen: false,
    base: '/templates/',
    // HACK: this is required when running our examples
    resolve:
      paths.appPath === paths.examplesPath
        ? {
            alias: {
              'react-dom': path.resolve(paths.ownNodeModules, 'react-dom')
            }
          }
        : {},
    server: {
      port: templatesPort,
      fs: {
        strict: false
      },
      hmr: {
        clientPort: templatesPort
      }
    },
    plugins: [react()]
  })

  // Start a WebSocket server so that we can send information about the templates.
  const wssPort = await getPort()
  const wss = new WebSocketServer({ port: wssPort })

  // Start another vite server for our client UI.
  const previewConfig = {
    root: paths.ownClientSrc,
    clearScreen: false,
    build: {
      outDir: paths.ownClientDist
    },
    [mode === 'dev' ? 'server' : 'preview']: {
      host,
      port: 8080,
      open: '/',
      proxy: {
        '^/templates/.+': {
          target: `http://${host}:${templatesPort}`
        },
        '/updates': {
          target: `ws://${host}:${wssPort}`,
          ws: true
        }
      }
    }
  }

  const createPreviewServer = mode === 'dev' ? createViteServer : preview
  const previewServer = await createPreviewServer(previewConfig)

  // Once the client has connected we send information about the project.
  wss.on('connection', function connection(client) {
    client.send(
      JSON.stringify({
        type: 'init',
        payload: {
          projectName: name,
          templates: getTemplates()
        }
      })
    )

    // Notify the client about changes.
    watcher.on('all', (...args) => {
      client.send(
        JSON.stringify({
          type: 'update',
          payload: { templates: getTemplates() }
        })
      )
    })
  })

  return {
    printUrls: () => {
      previewServer.printUrls()
    },
    listen: () => {
      return Promise.all([templatesServer.listen(), previewServer.listen?.()])
    },
    close: () => {
      return Promise.all([
        templatesServer.close(),
        previewServer.close?.(),
        watcher.close(),
        wss.close()
      ])
    }
  }
}

function getTemplates() {
  return Object.entries(watcher.getWatched()).map(([dirPath, files]) => {
    let manifest

    if (files.includes('manifest.json')) {
      try {
        manifest = JSON.parse(
          fs.readFileSync(path.join(dirPath, 'manifest.json'))
        )

        if (Array.isArray(manifest.previewImages)) {
          manifest.previewImages = manifest.previewImages.map(imagePath => {
            return imagePath.startsWith('.')
              ? '/templates/' +
                  path.relative(
                    paths.appTemplates,
                    path.join(dirPath, imagePath)
                  )
              : imagePath
          })
        }

        if (manifest.schema && manifest.previewData) {
          for (const [key, property] of Object.entries(manifest.schema)) {
            if (!property?.default) {
              continue
            }

            for (const preset of Object.values(manifest.previewData)) {
              preset[key] = property.default
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    return { name: dirPath.split('/').at(-1), manifest }
  })
}
