const webpack = require('webpack')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const paths = require('./paths')
const getClientEnv = require('./env').getClientEnv

const createConfig = (template, dotenv) => ({
  mode: 'production',
  bail: true,
  devtool: false,
  entry: {
    lib: path.join(paths.ownPath, 'lib', 'index.js'),
    template: path.join(paths.appTemplates, template)
  },
  output: {
    filename: '[name].js',
    library: 'template',
    libraryTarget: 'window',
    path: path.join(paths.appBuild)
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
        include: [paths.appSrc, path.join(paths.ownPath, 'lib')],
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: true,
              cacheDirectory: true,
              presets: [require.resolve('../babel')]
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|webm|ttf|eot|svg|otf|woff(2)?|mp4)(\?[a-z0-9=&.]+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8000000
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
      template: path.join(paths.ownPath, 'lib', 'index.html'),
      chunksSortMode: (a, b) => (a.names[0] === 'template' ? -1 : 1),
      inlineSource: '.(js|css)$'
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new webpack.DefinePlugin(dotenv.stringified)
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        cache: true,
        sourceMap: false
      })
    ]
  }
})

module.exports = ({ templates, dotenv }) =>
  templates.map(template => createConfig(template, dotenv))
