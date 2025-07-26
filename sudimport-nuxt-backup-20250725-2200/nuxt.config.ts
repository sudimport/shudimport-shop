import { defineNuxtConfig } from 'nuxt/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibility: {
    date: '2025-07-25'
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/tailwind.css'
  ],
  // Se usavi @nuxtjs/axios toglilo, usiamo $fetch + proxy
  vite: {
    plugins: [
      tsconfigPaths()
    ],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./', import.meta.url))
      }
    },
    server: {
      port: 4020,
      host: '0.0.0.0',
      allowedHosts: ['shop.sudimport.website'],
      proxy: {
        // tutto ciò che chiami /api/... qui viene inoltrato a ERP_URL
        '/api/': {
          target: process.env.ERP_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      ERP_URL: process.env.ERP_URL,
      ERP_API_KEY: process.env.ERP_API_KEY,
      ERP_API_SECRET: process.env.ERP_API_SECRET
    }
  },
  devtools: { enabled: false }
})
