import { babel } from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import pkg from './package.json'

const config = {
  input: 'src/index.js'
}

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
]

const plugins = [
  resolve({ extensions: ['.mjs', '.js', '.jsx', '.json', '.node'] }),
  commonjs(),
  babel({
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            esmodules: true
          }
        }
      ],
      '@babel/preset-react'
    ],
    babelHelpers: 'bundled'
  })
]

const cjs = Object.assign({}, config, {
  output: {
    file: `dist/${pkg.name}.cjs.js`,
    format: 'cjs',
    exports: 'named'
  },
  plugins,
  external
})

const es = Object.assign({}, config, {
  output: {
    format: 'es',
    exports: 'named',
    preserveModules: true,
    dir: 'dist/es'
  },
  plugins,
  external
})

export default [cjs, es]
