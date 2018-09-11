#! /usr/bin/env node

const chalk = require('chalk')
const program = require('commander')
const lib = require('..')
const pkg = require('../package.json')

const messages = lib.messages
const createCasparGraphics = lib.createCasparGraphics

let projectName

program
  .version(pkg.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name
  })
  .option(
    '-m, --mode [mode]',
    'Mode [1080p]',
    /^(1080p|1080i|720p|720i)$/i,
    '1080p'
  )
  .parse(process.argv)

createCasparGraphics({
  projectName,
  mode: program.mode
})
