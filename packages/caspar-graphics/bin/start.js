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
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils')
const openBrowser = require('react-dev-utils/openBrowser')
const createConfig = require('../config/webpack.config.dev')
const junk = require('junk')
const paths = require('../config/paths')
const getClientEnv = require('../config/env').getClientEnv
const createDevServerConfig = require('../config/webpackDevServer.config')
const path = require('path')

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080
const HOST = process.env.HOST || '0.0.0.0'
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
    const { mode = '1080p' } = packageJson['caspar-graphics'] || {}

    const size = mode.startsWith('720p')
      ? { width: 1280, height: 720 }
      : { width: 1920, height: 1080 }

    // Check if `caspar-graphics` is linked (e.g. yarn link).
    const isSymbolic = fs
      .lstatSync(path.join(paths.appNodeModules, 'caspar-graphics'))
      .isSymbolicLink()

    const templates = fs.readdirSync(paths.appTemplates).filter(junk.not)
    const dotenv = getClientEnv({ templates, host: HOST, port, size, mode })
    const config = createConfig({
      templates,
      appName,
      dotenv,
      isSymbolic
    })
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
