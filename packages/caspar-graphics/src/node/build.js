import { build as buildVite } from 'vite'
import fs from 'node:fs'
import { join } from 'node:path'
import { writeFile, copyFile, cp } from 'node:fs/promises'
import chokidar from 'chokidar'
import paths from './paths.js'
import chalk from 'chalk'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const TARGETS = {
  'ccg2.3.3': 'chrome71',
  nxt: 'chrome71',
  vercel: 'chrome71'
}

export async function build({
  version,
  include,
  target = 'ccg2.3.3',
  logLevel = 'error',
  outDir = 'dist',
  singleFile = true
}) {
  const plugins = [react()]

  if (singleFile && !target.startsWith('nxt')) {
    plugins.push(viteSingleFile())
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
      target: TARGETS[target] || target,
      minify: true,
      manifest: false,
      outDir: join(paths.appPath, outDir, name),
      emptyOutDir: true
    },
    plugins
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

  await Promise.all(
    templates.map(async ([name, path]) => {
      try {
        await buildVite(getConfig(name, path))

        if (target.startsWith('nxt') || target === 'vercel') {
          try {
            await copyFile(
              join(path, 'manifest.json'),
              join(paths.appPath, outDir, name, 'manifest.json')
            )
          } catch (err) {
            console.log(err)
          }
        } else if (singleFile) {
          await fs.rename(
            join(paths.appPath, outDir, name, 'index.html'),
            join(paths.appPath, outDir, `${name}.html`)
          )
          await fs.rm(join(paths.appPath, outDir, name), {
            recursive: true,
            force: true
          })
        }

        console.log(chalk.green('✓ ' + name))
      } catch (err) {
        console.log(chalk.red('✗ ' + name))
        console.error(err)
      }
    })
  )

  if (target === 'vercel') {
    const json = JSON.stringify({ templates: templates.map(([name]) => name) })
    await writeFile(join(paths.appPath, outDir, 'data.json'), json, 'utf8')
  }
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
