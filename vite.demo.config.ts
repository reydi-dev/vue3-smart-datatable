import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@reydi-dev/vue3-smart-datatable/styles.css',
        replacement: fileURLToPath(
          new URL('./src/styles/index.css', import.meta.url),
        ),
      },
      {
        find: '@reydi-dev/vue3-smart-datatable',
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
    ],
  },
  base: '/vue3-smart-datatable/',
  publicDir: 'playground/public',
  build: { outDir: 'dist-demo' },
})
