import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/vue3-smart-datatable/',
  build: { outDir: 'dist-demo' },
})
