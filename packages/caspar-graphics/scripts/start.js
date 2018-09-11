#! /usr/bin/env node
'use strict'

process.env.NODE_ENV = 'development'

const fs = require('fs-extra')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const clearConsole = require('react-dev-utils/clearConsole')
const {
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

setPorts()
  .then(() => {
    const port = (process.env.PORT && parseInt(process.env.PORT)) || 8080
    const host = process.env.HOST || '0.0.0.0'
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
    const packageJson = require(paths.appPackageJson)
    const { appName } = packageJson
    const { mode = '1080p' } = packageJson['caspar-graphics'] || {}
    const templates = fs.readdirSync(paths.appTemplates).filter(junk.not)
    const dotenv = getClientEnv({ templates, host, port, mode })
    const config = createConfig({ templates, appName, dotenv })
    const urls = prepareUrls(protocol, host, port)
    const proxySetting = require(paths.appPackageJson).proxy
    const compiler = createCompiler(
      webpack,
      config,
      appName,
      urls,
      paths.useYarn
    )
    const serverConfig = createDevServerConfig(
      config,
      prepareProxy(proxySetting, paths.appPublic),
      urls.lanUrlForConfig
    )

    const devServer = new WebpackDevServer(compiler, serverConfig)

    devServer.listen(port, host, err => {
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
