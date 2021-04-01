const webpack = require('webpack')
const path = require('path')
const paths = require('./paths')
const nodePath = require('./env').nodePath
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

const createConfig = (template, { dotenv, isSymbolic, gzip }) => ({
  mode: 'production',
  bail: true,
  devtool: false,
  optimization: {
    minimize: true
  },
  entry: {
    create: path.join(paths.ownLib, 'template', 'create.prod')
  },
  output: {
    filename: '[name].js',
    path: path.join(paths.appBuild)
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
      template: path.join(paths.appTemplates, template),
      ...(isSymbolic
        ? {
            // We need this when running `yarn link`
            react: require.resolve(path.join(paths.ownNodeModules, 'react')),
            'react-dom': require.resolve(
              path.join(paths.ownNodeModules, 'react-dom')
            )
          }
        : {})
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
              plugins: [require.resolve('babel-plugin-styled-components')]
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
              limit: 8e6
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: template,
      filename: `${template}.html`,
      template: path.join(paths.ownLib, 'template', 'index.html')
    }),
    new ScriptExtHtmlWebpackPlugin({
      inline: /\.js$/
    }),
    new webpack.DefinePlugin(dotenv.stringified),
    new webpack.DefinePlugin({
      'process.env.TEMPLATE_PATH': JSON.stringify(
        path.join(paths.appTemplates, template)
      )
    }),
    ...(gzip ? [new CompressionPlugin()] : [])
  ]
})

module.exports = ({ templates, ...args }) =>
  templates.map(template => createConfig(template, args))
