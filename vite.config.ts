import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './modules'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@headlessui/react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  esbuild: {
    target: 'es2015',
    format: 'esm',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
