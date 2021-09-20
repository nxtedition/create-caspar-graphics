const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const nodePath = require('./env').nodePath
const paths = require('./paths')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

module.exports = ({ templates, appName, dotenv, isSymbolic }) => ({
  mode: 'development',
  context: process.cwd(),
  target: 'web',
  devtool: 'cheap-module-source-map',
  entry: {
    create: path.join(paths.ownLib, 'template', 'create.dev'),
    preview: [path.join(paths.ownLib, 'preview')]
  },
  output: {
    pathinfo: true,
    filename: '[name].js',
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
    extensions: ['.js', '.jsx'],
    alias: isSymbolic
      ? {
          // When running yarn link caspar-graphics react complains
          // about multiple instances.
          react: require.resolve(path.join(paths.ownNodeModules, 'react')),
          'react-dom': require.resolve(
            path.join(paths.ownNodeModules, 'react-dom')
          ),
          'react-refresh/runtime': require.resolve(
            path.join(paths.ownNodeModules, 'react-refresh/runtime')
          )
        }
      : {}
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
        include: [
          paths.appSrc,
          paths.ownLib,
          paths.graphicsKit,
          path.join(paths.appNodeModules, '@nxtedition/graphics-kit')
        ],
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              cacheDirectory: true,
              presets: [require.resolve('babel-preset-react-app')],
              plugins: [
                require.resolve('babel-plugin-styled-components'),
                require.resolve('react-refresh/babel')
              ]
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
      template: path.join(paths.ownLib, 'preview', 'index.html'),
      chunks: ['preview']
    }),
    ...templates.map(
      name =>
        new HtmlWebpackPlugin({
          title: name,
          filename: `${name}.html`,
          template: path.join(paths.ownLib, 'template', 'index.html'),
          chunks: ['create']
        })
    ),
    ...(!isSymbolic
      ? [
          new webpack.WatchIgnorePlugin([
            path.join(paths.ownLib, 'preview'),
            path.join(paths.ownLib, 'lib')
          ])
        ]
      : []),
    new webpack.DefinePlugin(dotenv.stringified),
    new ReactRefreshWebpackPlugin()
  ]
})
