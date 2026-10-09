import fs from 'node:fs'
import path from 'node:path'
import chokidar from 'chokidar'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import getPort from 'get-port'
import { createServer as createViteServer, preview } from 'vite'
import paths from './paths.js'
import { WebSocketServer } from 'ws'
import net from 'node:net'

class AMCPConnection {
  constructor(url, { channel = 1, onConnect, onClose, onError }) {
    url = new URL(url)
    this.url = url.href
    this.host = url.hostname
    this.port = url.port || 5250
    this.channel = channel
    this.onConnect = onConnect
    this.onClose = onClose
    this.onError = onError
    this._destroyed = false

    if (!this.host || !this.port) {
      throw new Error(`Invalid argument url=${url}`)
    }

    this._connect()
  }

  _connect() {
    if (this._destroyed) return
    this.socket = net
      .connect(this.port, this.host)
      .on('connect', () => this.onConnect?.())
      .on('error', (err) => {
        console.log('amcp error', err)
        this.onError?.(err)
      })
      .on('close', () => {
        console.log('amcp close')
        this.onClose?.()
        if (!this._destroyed) {
          setTimeout(() => this._connect(), 2000)
        }
      })
      .setEncoding('utf8')
  }

  send(...args) {
    if (this.socket?.writable) {
      this.socket.write(args.join(' ') + '\r\n')
    }
  }

  destroy() {
    this._destroyed = true
    this.socket?.destroy()
  }
}

const watcher = chokidar.watch(
  paths.appTemplates + '/**/(index.html|manifest.json)',
  {
    depth: 1,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  },
)

const REMOVED_PATH = '/__caspar-graphics/removed'
const LAYER_PARAM = 'casparLayer'

// Injected into templates served to CasparCG. Wraps window.remove() so that the dev
// server is notified once a template has finished animating out and removed itself.
// Only active when the template was loaded with a layer param, i.e. by CasparCG and
// not by the preview iframe.
const removeNotifierScript = `
(function () {
  var layer = new URLSearchParams(location.search).get('${LAYER_PARAM}')
  if (!layer) return
  var remove = window.remove
  function wrapped() {
    navigator.sendBeacon('${REMOVED_PATH}?layer=' + encodeURIComponent(layer))
    return remove && remove.apply(this, arguments)
  }
  Object.defineProperty(window, 'remove', {
    configurable: true,
    get: function () { return wrapped },
    set: function (fn) { remove = fn },
  })
})()
`

function removeNotifier(onRemoved) {
  return {
    name: 'caspar-graphics-remove-notifier',
    apply: 'serve',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          children: removeNotifierScript,
          injectTo: 'head-prepend',
        },
      ]
    },
    configureServer(server) {
      server.middlewares.use(REMOVED_PATH, (req, res) => {
        const url = new URL(req.url, 'http://localhost')
        const [channel, layer] = (url.searchParams.get('layer') || '').split(
          '-',
        )
        if (channel && layer) {
          onRemoved({ channel: Number(channel), layer: Number(layer) })
        }
        res.statusCode = 204
        res.end()
      })
    },
  }
}

export async function createServer({ name, mode, host = 'localhost' }) {
  // Start a WebSocket server so that we can send information about the templates.
  const wssPort = await getPort()
  const wss = new WebSocketServer({ port: wssPort })

  function onTemplateRemoved(payload) {
    console.log('removed', payload)
    const message = JSON.stringify({ type: 'removed', payload })
    for (const client of wss.clients) {
      client.send(message)
    }
  }

  // Start a vite server for the user's templates.
  const templatesPort = await getPort()
  const templatesConfig = {
    root: paths.appTemplates,
    clearScreen: false,
    base: '/templates/',
    // HACK: this is required when running our examples
    resolve:
      paths.appPath === paths.examplesPath
        ? {
            alias: {
              'react-dom': path.resolve(paths.ownNodeModules, 'react-dom'),
            },
          }
        : {},
    esbuild: {
      target: 'chrome71',
    },
    server: {
      host: true,
      port: templatesPort,
      fs: {
        strict: false,
      },
      hmr: {
        clientPort: templatesPort,
      },
    },
    plugins: [react(), vue(), removeNotifier(onTemplateRemoved)],
  }
  const createTemplatesServer = mode === 'preview' ? preview : createViteServer
  const templatesServer = await createTemplatesServer(templatesConfig)

  // Start another vite server for our client UI.
  const previewConfig = {
    root: paths.ownClientSrc,
    clearScreen: false,
    build: {
      outDir: paths.ownClientDist,
    },
    [mode === 'dev' ? 'server' : 'preview']: {
      host: true,
      port: 8080,
      open: '/',
      proxy: {
        '^/templates/.+': {
          target: `http://${host}:${templatesPort}`,
        },
        '/updates': {
          target: `ws://${host}:${wssPort}`,
          ws: true,
        },
      },
    },
  }

  const createPreviewServer = mode === 'dev' ? createViteServer : preview
  const previewServer = await createPreviewServer(previewConfig)
  let connection

  // Once the client has connected we send information about the project.
  wss.on('connection', (client) => {
    client.send(
      JSON.stringify({
        type: 'init',
        payload: {
          projectName: name,
          templates: getTemplates(),
        },
      }),
    )

    function onConnect() {
      client.send(JSON.stringify({ type: 'connected' }))
    }

    function onClose() {
      console.log('close')
    }

    function onError(err) {
      console.log('error:', err)
    }

    function connect(data) {
      console.log('connect', data)

      if (
        !connection ||
        connection.url !== data.url ||
        connection.channel !== data.channel
      ) {
        connection?.destroy()
        connection = new AMCPConnection(data.url, {
          channel: data.channel,
          onConnect,
          onClose,
          onError,
        })
      } else {
        connection.onConnect = onConnect
        connection.onClose = onClose
        connection.onError = onError
        if (connection.socket?.writable) {
          onConnect()
        }
      }
    }

    function load(data) {
      console.log('load', data)
      const baseUrl = templatesServer.resolvedUrls.network[0]?.replace(
        '/templates/',
        '',
      )
      const { channel = connection.channel, layer, source } = data
      connection.send(
        `CG`,
        `${channel}-${layer}`,
        `ADD`,
        1,
        `${baseUrl}${source}?${LAYER_PARAM}=${channel}-${layer}`,
        0,
      )
    }

    function update(payload) {
      console.log('update', payload)
      const { channel = connection.channel, layer, data = {} } = payload
      connection.send(
        `CG`,
        `${channel}-${layer}`,
        `UPDATE`,
        1,
        '"<templateData>' +
          Buffer.from(JSON.stringify(data)).toString('base64') +
          '</templateData>"',
      )
    }

    function play(data) {
      console.log('play', data)
      const { channel = connection.channel, layer } = data
      connection.send(`CG`, `${channel}-${layer}`, `PLAY`, 1)
    }

    function stop(data) {
      console.log('stop', data)
      const { channel = connection.channel, layer } = data
      connection.send(`CG`, `${channel}-${layer}`, `STOP`, 1)
    }

    client.on('message', (message) => {
      const { type, ...data } = JSON.parse(message)

      const fn = {
        connect,
        load,
        update,
        play,
        stop,
      }[type]

      if (fn) {
        fn(data)
      }
    })

    // Notify the client about changes.
    watcher.on('all', (...args) => {
      client.send(
        JSON.stringify({
          type: 'update',
          payload: { templates: getTemplates() },
        }),
      )
    })
  })

  return {
    printUrls: () => {
      previewServer.printUrls()
    },
    listen: () => {
      return Promise.all([templatesServer.listen?.(), previewServer.listen?.()])
    },
    close: () => {
      return Promise.all([
        templatesServer.close?.(),
        previewServer.close?.(),
        watcher.close(),
        wss.close(),
      ])
    },
  }
}

function getTemplates() {
  return Object.entries(watcher.getWatched())
    .map(([dirPath, files]) => {
      let manifest

      if (!files.includes('manifest.json') || !files.includes('index.html')) {
        return
      }

      try {
        manifest = JSON.parse(
          fs.readFileSync(path.join(dirPath, 'manifest.json')),
        )

        if (Array.isArray(manifest.previewImages)) {
          manifest.previewImages = manifest.previewImages.map((imagePath) => {
            return imagePath.startsWith('.')
              ? '/templates/' +
                  path.relative(
                    paths.appTemplates,
                    path.join(dirPath, imagePath),
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
              if (!preset[key]) {
                preset[key] = property.default
              }
            }
          }
        }
      } catch (err) {
        console.error(err)
      }

      return { name: dirPath.split(path.sep).at(-1), manifest }
    })
    .filter(Boolean)
}
