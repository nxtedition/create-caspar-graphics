#! /usr/bin/env node
'use strict'
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('../config/env')

const webpack = require('webpack')
const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const paths = require('../config/paths')
const packageJson = require(paths.appPackageJson)
const { mode = '1080p' } = packageJson['caspar-graphics'] || {}
const createConfig = require('../config/webpack.config.prod')
const printErrors = require('../utils/printErrors')
const logger = require('../utils/logger')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild
const junk = require('junk')

function build() {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild)
  const templates = fs.readdirSync(paths.appTemplates).filter(junk.not)
  const config = createConfig(templates)

  process.noDeprecation = true // turns off that loadQuery clutter.
  console.log('Building graphics...')

  return new Promise((resolve, reject) => {
    compile(config, (err, stats) => {
      if (err) {
        reject(err)
      }

      const messages = formatWebpackMessages(stats.toJson({}, true))
      if (messages.errors.length) {
        return reject(new Error(messages.errors.join('\n\n')))
      }

      if (
        messages.warnings.length &&
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false')
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        )
        return reject(new Error(messages.warnings.join('\n\n')))
      }

      // Remove js files.
      fs.readdirSync(paths.appBuild).forEach(file => {
        if (file.match(/.*\.js/gi)) {
          fs.unlinkSync(path.join(paths.appBuild, file))
        }
      })

      return resolve()
    })
  })
}

// Wrap webpack compile in a try catch.
function compile(config, cb) {
  let compiler

  try {
    compiler = webpack(config)
  } catch (e) {
    printErrors('Failed to compile.', [e])
    process.exit(1)
  }

  compiler.run((err, stats) => {
    cb(err, stats)
  })
}

build().then(
  () => {
    console.log(chalk.green('Built successfully.\n'))
    // console.log('File sizes after gzip:\n');
    // printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild);
    console.log()
  },
  err => {
    console.log(chalk.red('Failed to compile.\n'))
    console.log((err.message || err) + '\n')
    process.exit(1)
  }
)
