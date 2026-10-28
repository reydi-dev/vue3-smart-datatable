import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Ordinary consumer defaults: no aliases, workspace links or source fallbacks.
export default defineConfig({ plugins: [vue()] })
