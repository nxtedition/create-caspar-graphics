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
const getClientEnv = require('../config/env').getClientEnv
const packageJson = require(paths.appPackageJson)
let { mode = '1080p', gzip = 'both', size } =
  packageJson['caspar-graphics'] || {}
const createConfig = require('../config/webpack.config.prod')
const printErrors = require('../utils/printErrors')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const junk = require('junk')
const commandLineArgs = require('command-line-args')
const optionDefinitions = [
  { name: 'include', alias: 'i', type: String, multiple: true },
  { name: 'exclude', alias: 'e', type: String, multiple: true }
]

async function build() {
  const options = commandLineArgs(optionDefinitions, { argv: process.argv })
  const allTemplates = fs.readdirSync(paths.appTemplates)
  const templates = allTemplates.filter(junk.not).filter(template => {
    if (Array.isArray(options.include)) {
      return options.include.includes(template)
    }

    if (Array.isArray(options.exclude)) {
      return !options.exclude.includes(template)
    }

    return true
  })

  if (templates.length === 0) {
    console.log()

    if (options.include) {
      console.log(chalk.red(`Couldn't find any of the specified templates.`))
      console.log(`\nHere are all the available templates:\n`)
      console.log(' ' + allTemplates.join('\n '))
    } else {
      console.log(
        chalk.red(`Couldn't find any templates to build, aborting...`)
      )
    }

    console.log()
    process.exit(0)
  }

  // Remove all the templates we're about to build, but keep the directory
  // so that if you're in it, you don't end up in Trash.
  templates.forEach(template => {
    try {
      fs.unlinkSync(path.join(paths.appBuild, `${template}.html`))
    } catch (err) {}
  })

  process.noDeprecation = true // turns off that loadQuery clutter.
  console.log(
    `\nBuilding graphics:\n\n${chalk.cyan(' ' + templates.join('\n '))}\n`
  )

  // Check if `caspar-graphics` is linked (e.g. yarn link).
  const isSymbolic = fs
    .lstatSync(path.join(paths.appNodeModules, 'caspar-graphics'))
    .isSymbolicLink()

  if (!size) {
    size = mode.startsWith('720p')
      ? { width: 1280, height: 720 }
      : { width: 1920, height: 1080 }
  }

  for (const template of templates) {
    const dotenv = getClientEnv({ templates: [template], mode, size })
    const config = createConfig({
      templates: [template],
      dotenv,
      isSymbolic,
      gzip
    })

    await new Promise((resolve, reject) => {
      compile(config, (err, stats) => {
        let messages

        if (err) {
          if (!err.message) {
            return reject(err)
          }

          let errMessage = err.message

          // Add additional information for postcss errors
          if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
            errMessage +=
              '\nCompileError: Begins at CSS selector ' +
              err['postcssNode'].selector
          }

          messages = formatWebpackMessages({
            errors: [errMessage],
            warnings: []
          })
        } else {
          messages = formatWebpackMessages(
            stats.toJson({ all: false, warnings: true, errors: true })
          )
        }
        if (messages.errors.length) {
          // Only keep the first error. Others are often indicative
          // of the same problem, but confuse the reader with noise.
          if (messages.errors.length > 1) {
            messages.errors.length = 1
          }
          return reject(new Error(messages.errors.join('\n\n')))
        }

        // Remove html files.
        if (gzip === true) {
          fs.readdirSync(paths.appBuild).forEach(file => {
            if (file.match(/.*\.html$/gi)) {
              fs.unlinkSync(path.join(paths.appBuild, file))
            }
          })
        }

        return resolve()
      })
    })
  }
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
    console.log()
  },
  err => {
    console.log(chalk.red('Failed to compile.\n'))
    console.log((err.message || err) + '\n')
    process.exit(1)
  }
)
