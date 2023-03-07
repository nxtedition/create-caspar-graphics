import fs from 'node:fs'
import process from 'node:process'
import chalk from 'chalk'
import { cac } from 'cac'
import paths from './paths.js'

const cli = cac()
const ownPkg = JSON.parse(fs.readFileSync(paths.ownPackageJson))
const appPkg = JSON.parse(fs.readFileSync(paths.appPackageJson))

const getOptions = clOptions => ({
  version: ownPkg.version,
  name: appPkg.name,
  ...(appPkg.casparGraphics || {}),
  ...clOptions
})

// Start
cli
  .command('[root]', 'start dev server')
  .option('--port <port>', 'specify which port the server should listen on.')
  .option(
    '--host <host>',
    'specify which IP addresses the server should listen on.'
  )
  .option('--mode <mode>', 'specify which mode to run the preview server in.')
  .action(async (root, options) => {
    try {
      const { createServer } = await import('./server.js')
      const server = await createServer(getOptions(options))
      await server.listen()
      console.log(
        chalk.green(`${chalk.bold('Caspar Graphics')} v${ownPkg.version}`)
      )
      server.printUrls()

      process.on('SIGINT', async () => {
        await server.close()
        process.exit()
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

// Build
cli
  .command('build [root]', 'build for production')
  .option('-i, --include [...templates]', 'templates included in this build')
  .option(
    '--target <target>',
    '[string] browser compatibility target for the final bundle'
  )
  .option('--singleFile', '[boolean] inline JavaScript and CSS resources into a single html file per template')
  .option('--outDir <outDir>' , '[string] output directory (relative to project root).')
  .action(async (root, options) => {
    const { build } = await import('./build.js')
    await build(getOptions(options))
    process.exit(0)
  })

cli.help()
cli.version(ownPkg.version)
cli.parse()
