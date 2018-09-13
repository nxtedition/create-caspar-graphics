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
const { mode = '1080p' } = packageJson['caspar-graphics'] || {}
const createConfig = require('../config/webpack.config.prod')
const printErrors = require('../utils/printErrors')
const logger = require('../utils/logger')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild
const junk = require('junk')
const commandLineArgs = require('command-line-args')
const optionDefinitions = [
  { name: 'include', alias: 'i', type: String, multiple: true },
  { name: 'exclude', alias: 'e', type: String, multiple: true }
]

function build() {
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

  const dotenv = getClientEnv({ templates, mode })
  const config = createConfig({ templates, dotenv })

  process.noDeprecation = true // turns off that loadQuery clutter.
  console.log(
    `\nBuilding graphics:\n\n${chalk.cyan(' ' + templates.join('\n '))}\n`
  )

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
