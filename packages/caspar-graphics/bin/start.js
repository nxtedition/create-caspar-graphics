#! /usr/bin/env node
'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('../config/env')

const fs = require('fs-extra')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
// const clearConsole = require('react-dev-utils/clearConsole')
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils')
const openBrowser = require('react-dev-utils/openBrowser')
const createConfig = require('../config/webpack.config.dev')
const printErrors = require('../utils/printErrors')
const logger = require('../utils/logger')
const setPorts = require('../utils/setPorts')
const junk = require('junk')
const path = require('path')
const paths = require('../config/paths')
const getClientEnv = require('../config/env').getClientEnv
const createDevServerConfig = require('../config/webpackDevServer.config')

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080
const HOST = process.env.HOST || '0.0.0.0'
const isInteractive = process.stdout.isTTY
const useYarn = fs.existsSync(paths.yarnLockFile)

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `choosePort()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
  .then(port => {
    if (port == null) {
      // We have not found a port.
      return
    }
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const packageJson = require(paths.appPackageJson)
    const { appName } = packageJson
    let { mode = '1080p', size } = packageJson['caspar-graphics'] || {}

    if (!size && mode) {
      size =
        mode === '720p'
          ? { width: 1280, height: 720 }
          : { width: 1920, height: 1080 }
    }

    const templates = fs.readdirSync(paths.appTemplates).filter(junk.not)
    const dotenv = getClientEnv({ templates, host: HOST, port, size })
    const config = createConfig({ templates, appName, dotenv })
    // const watchOptions = templates.map(template => ({
    //   input: path.join(paths.appTemplates, template, 'index.js'),
    //   plugins: [
    //     // resolve(),
    //     babel({
    //       runtimeHelpers: true,
    //       babelrc: false,
    //       presets: [
    //         ["react-app", { modules: false }]
    //       ],
    //       exclude: [paths.appNodeModules, paths.ownNodeModules]
    //     })
    //   ],
    //   output: {
    //     name: template,
    //     file: 'dist/' + template + '.js',
    //     // dir: 'dist',
    //     format: 'cjs'
    //   }
    // }))
    // const watcher = rollup.watch(watchOptions);
    const urls = prepareUrls(protocol, HOST, port)
    const proxySetting = require(paths.appPackageJson).proxy
    const compiler = createCompiler({
      webpack,
      config,
      appName,
      urls,
      useYarn
    })
    const serverConfig = createDevServerConfig(
      config,
      prepareProxy(proxySetting, paths.appPublic),
      urls.lanUrlForConfig
    )

    const devServer = new WebpackDevServer(compiler, serverConfig)

    devServer.listen(port, HOST, err => {
      if (err) {
        return console.log(err)
      }

      console.clear()
      console.log(chalk.cyan('Starting the development server...\n'))
      openBrowser(urls.localUrlForBrowser)
    })
    ;['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close()
        process.exit()
      })
    })
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
