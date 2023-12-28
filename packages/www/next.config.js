const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

module.exports = withNextra({
  experimental: {
    appDir: true
  },
  async rewrites() {
    return [
      {
        source: '/examples/:path*',
        destination: 'https://caspar-graphics-examples.vercel.app/:path*'
      }
    ]
  }
})
