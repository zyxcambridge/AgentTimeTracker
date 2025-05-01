import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    base: isProduction ? '/AgentTimeTracker/' : '',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
    server: {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
      },
      middlewareMode: false,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
