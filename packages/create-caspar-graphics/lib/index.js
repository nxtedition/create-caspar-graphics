'use strict'

const path = require('path')
const fs = require('fs')
const copyDir = require('./utils/copy-dir')
const install = require('./utils/install')
const messages = require('./messages')
const os = require('os')

module.exports = function createCasparGraphics(opts) {
  const projectName = opts.projectName

  if (!projectName) {
    console.log(messages.missingProjectName())
    process.exit(1)
  }

  if (fs.existsSync(projectName)) {
    console.log(messages.alreadyExists(projectName))
    process.exit(1)
  }

  const projectPath = (opts.projectPath = process.cwd() + '/' + projectName)
  const templatePath = path.resolve(__dirname, '../templates/default')
  copyDir({ templatePath, projectPath, projectName, mode: opts.mode })
    .then(installWithMessageFactory(opts))
    .catch(function(err) {
      throw err
    })
}

function installWithMessageFactory(opts) {
  const projectName = opts.projectName
  const projectPath = opts.projectPath
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    license: 'UNLICENSED',
    scripts: {
      start: 'caspar-graphics start',
      dev: 'caspar-graphics start',
      build: 'caspar-graphics build',
      precommit: 'lint-staged'
    },
    'lint-staged': {
      '*.{js,json,css,md}': [
        'prettier --single-quote --no-semi --write',
        'git add'
      ]
    },
    'caspar-graphics': {
      mode: opts.mode
    }
  }

  return function installWithMessage() {
    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2) + os.EOL
    )

    return install({
      projectName,
      projectPath,
      packages: ['caspar-graphics', 'lint-staged', 'prettier', 'husky']
    })
      .then(function() {
        console.log(messages.start(projectName))
      })
      .catch(function(err) {
        throw err
      })
  }
}
