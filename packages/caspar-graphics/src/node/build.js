import { build as buildVite } from 'vite'
import fs from 'fs'
import { resolve, join } from 'path'
import chokidar from 'chokidar'
import paths from './paths.js'
import chalk from 'chalk'

export async function build({
  version,
  include,
  target = 'chrome71', // CasparCG v2.3.2
  logLevel = 'error',
  outDir = 'dist',
  manifest = false,
  gzip = false
}) {
  if (!fs.existsSync(paths.ownBuild)) {
    fs.mkdirSync(paths.ownBuild)
  }

  const getConfig = (name, path) => ({
    root: path,
    clearScreen: false,
    base: './',
    logLevel,
    resolve: {
      // NOTE: this is required when graphics-kit is linked.
      dedupe: ['react', 'react-dom']
      // react: resolve(paths.appNodeModules, 'react'),
      // 'react-dom': resolve(paths.appNodeModules, 'react-dom')
    },
    build: {
      target,
      minify: false,
      manifest: false,
      outDir: join(paths.appPath, outDir, name),
      emptyOutDir: true
    }
  })

  let templates = await getTemplates()

  // Remove templates that weren't included in this build.
  if (typeof include === 'string' || Array.isArray(include)) {
    const arr = Array.isArray(include) ? include : [include]
    templates = templates.filter(([name]) => arr.includes(name))
  }

  console.log(
    chalk.cyan(`Caspar Graphics v${version}`) +
      ' ' +
      chalk.green(
        `building ${templates.length} template${
          templates.length === 1 ? '' : 's'
        }...`
      )
  )

  return Promise.all(
    templates.map(async ([name, path]) => {
      try {
        await buildVite(getConfig(name, path))
        console.log(chalk.green('✓ ' + name))
      } catch (err) {
        console.log(chalk.red('✗ ' + name))
      }
    })
  )
}

const watcher = chokidar.watch(paths.appTemplates + '/**/index.html', {
  depth: 1
})

async function getTemplates() {
  return new Promise(resolve => {
    watcher.on('ready', () => {
      resolve(
        Object.keys(watcher.getWatched()).map(path => [
          path.split('/').at(-1),
          path
        ])
      )
    })
  })
}
