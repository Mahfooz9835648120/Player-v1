import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    {
      name: 'admin-html-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/admin' || req.url === '/admin.html') {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        admin: path.resolve('admin.html'),
      },
    },
  },
});
