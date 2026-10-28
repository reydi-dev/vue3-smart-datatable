import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'package-boundary',
      generateBundle() {
        for (const id of this.getModuleIds()) {
          const path = id.replaceAll('\\', '/')
          if (
            /\/node_modules\/(?:vue|@vue)\//.test(path) ||
            path.includes('/playground/') ||
            path.includes('/docs/examples/') ||
            path.includes('/tests/')
          ) {
            this.error(`Unexpected library runtime module: ${path}`)
          }
        }
      },
    },
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'smart-data-table',
      cssFileName: 'smart-data-table',
    },
    rollupOptions: { external: ['vue'] },
  },
})
