import path from 'path'
import fs from 'fs'
import url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const resolveOwn = relativePath =>
  path.resolve(__dirname, '../../', relativePath)

const appPath = resolveApp('.')
const appNodeModules = resolveApp('node_modules')

export default {
  appPath,
  appNodeModules,
  appBuild: resolveApp('dist'),
  appPackageJson: resolveApp('package.json'),
  appTemplates: resolveApp('templates'),
  ownClient: resolveOwn('./src/client'),
  ownPackageJson: resolveOwn('package.json'),
  ownBuild: path.join(appNodeModules, '.caspar-graphics')
}
