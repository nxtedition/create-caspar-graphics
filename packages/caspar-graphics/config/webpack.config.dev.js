const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodePath = require('./env').nodePath
const paths = require('./paths')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = ({ templates, appName, dotenv }) => ({
  mode: 'development',
  context: process.cwd(),
  target: 'web',
  devtool: 'cheap-module-source-map',
  entry: {
    ...templates.reduce(
      (acc, name) => ({
        ...acc,
        [name]: [
          require.resolve('react-dev-utils/webpackHotDevClient'),
          path.join(paths.appTemplates, name)
        ]
      }),
      {}
    ),
    preview: [
      require.resolve('react-dev-utils/webpackHotDevClient'),
      path.join(paths.ownLib, 'preview')
    ],
    lib: paths.ownLib
  },
  output: {
    pathinfo: true,
    filename: '[name].js',
    library: 'template',
    libraryTarget: 'window',
    publicPath: '/',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
  },
  // We need to tell webpack how to resolve both create-caspar-graphics'
  // node_modules and the user's, so we use resolve and resolveLoader.
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      // It is guaranteed to exist because we tweak it in `env.js`
      nodePath.split(path.delimiter).filter(Boolean)
    ),
    extensions: ['.js'],
    alias: {
      // This is required so symlinks work during development.
      'webpack/hot/poll': require.resolve('webpack/hot/poll')
    }
  },
  resolveLoader: {
    modules: [paths.appNodeModules, paths.ownNodeModules]
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')]
      },
      {
        test: /\.(js|jsx|mjs)$/,
        include: [paths.appSrc, paths.ownLib],
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: true,
              cacheDirectory: true,
              presets: [require('babel-preset-react-app')]
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|webm|webp|ttf|eot|svg|otf|woff(2)?|mp4)(\?[a-z0-9=&.]+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MonacoWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      title: appName,
      filename: 'index.html',
      template: path.join(paths.ownLib, 'index.html'),
      chunks: ['preview']
    }),
    ...templates.map(
      name =>
        new HtmlWebpackPlugin({
          title: name,
          filename: `${name}.html`,
          template: path.join(paths.ownLib, 'index.html'),
          chunks: ['lib', name],
          chunksSortMode: (a, b) => (a.names[0] === name ? -1 : 1)
        })
    ),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin(dotenv.stringified)
  ]
})
