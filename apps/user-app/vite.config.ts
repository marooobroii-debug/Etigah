import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      react: path.resolve(new URL('../../node_modules/react', import.meta.url).pathname),
      'react-dom': path.resolve(new URL('../../node_modules/react-dom', import.meta.url).pathname),
    },
  },
  server: {
    hmr: {
      host: 'laughing-enigma-jjpqwxx497xxhqpgr-5173.app.github.dev',
      clientPort: 443,
      protocol: 'wss',
    },
  },
});
