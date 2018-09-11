'use strict'

const chalk = require('chalk')
const getInstallCmd = require('./utils/get-install-cmd')
const output = require('./utils/output')

const program = {
  name: 'create-caspar-graphics'
}

exports.missingProjectName = () => {
  return `
Please specify the project directory:
  ${chalk.cyan(program.name)} ${chalk.green('<project-directory>')}
`
}

exports.alreadyExists = projectName => {
  return `
Uh oh! Looks like there's already a directory called ${chalk.red(
    projectName
  )}. Please try a different name or delete that folder.`
}

exports.installing = packages => {
  const pkgText = packages
    .map(function(pkg) {
      return `    ${chalk.cyan(chalk.bold(pkg))}`
    })
    .join('\n')

  return `
  Installing npm modules:
${pkgText}
`
}

exports.installError = packages => {
  const pkgText = packages
    .map(function(pkg) {
      return `${chalk.cyan(chalk.bold(pkg))}`
    })
    .join(', ')

  output.error(`Failed to install ${pkgText}, try again.`)
}

exports.copying = projectName =>
  `Creating ${chalk.bold(chalk.green(projectName))}...`

exports.start = projectName => {
  const cmd = getInstallCmd()

  const commands = {
    install: cmd === 'npm' ? 'npm install' : 'yarn',
    build: cmd === 'npm' ? 'npm run build' : 'yarn build',
    dev: cmd === 'npm' ? 'npm start' : 'yarn start'
  }

  return `
  ${chalk.green('Awesome!')} You're now ready to start coding.

  We already ran ${output.cmd(
    commands.install
  )} for you, so your next steps are:
    ${output.cmd(`cd ${projectName}`)}

  To start a local server for development:
    ${output.cmd(commands.dev)}

  To build a version for production:
    ${output.cmd(commands.build)}

  Questions? Feedback? Please let us know!
  ${chalk.green('https://github.com/nxtedition/caspar-graphics/issues')}
`
}
