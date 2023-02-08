
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV == 'development'
})

module.exports = withPWA({
  images: { domains: ['images.openfoodfacts.org'], formats: ['image/avif', 'image/webp'], },
  experimental: {
    appDir: true,
  },
})