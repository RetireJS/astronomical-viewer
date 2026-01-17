import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/astronomical-viewer/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      astronomical: fileURLToPath(
        new URL('./node_modules/astronomical/lib/cjs/index.js', import.meta.url),
      ),
    },
  },
  build: {
    commonjsOptions: {
      include: [/astronomical/, /node_modules/],
    },
  },
})
