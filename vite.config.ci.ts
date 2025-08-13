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
    target: 'es2020',
    minify: 'esbuild', // Faster than terser for CI
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Optimize chunking for CI builds
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit'],
        },
      },
      // Reduce memory usage during build
      maxParallelFileOps: 2,
    },
  },
  esbuild: {
    // Drop console logs in CI builds
    drop: process.env.CI ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
  server: {
    hmr: false, // Disable HMR in CI
  },
  // Reduce memory usage
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})
