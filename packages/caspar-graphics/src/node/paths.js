import path from 'path'
import fs from 'fs'
import url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)
const resolveOwn = relativePath =>
  path.resolve(__dirname, '../../', relativePath)

export default {
  appPath: resolveApp('.'),
  appBuild: resolveApp('dist'),
  appPackageJson: resolveApp('package.json'),
  appTemplates: resolveApp('templates'),
  ownPackageJson: resolveOwn('package.json'),
  ownClientSrc: resolveOwn('./src/client'),
  ownClientDist: resolveOwn('dist'),
  ownNodeModules: resolveOwn('../../node_modules/'),
  examplesPath: resolveOwn('../examples')
}
