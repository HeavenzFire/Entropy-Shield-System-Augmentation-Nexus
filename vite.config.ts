import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const localModelTarget = (env.LOCAL_LLM_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
  const localModelProxy = {
    '/api/local-llm': {
      target: localModelTarget,
      changeOrigin: false,
      rewrite: (requestPath: string) => requestPath.replace(/^\/api\/local-llm/, '')
    }
  };
  return {
    server: { port: 3000, host: '127.0.0.1', proxy: localModelProxy },
    preview: { host: '127.0.0.1', proxy: localModelProxy },
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } }
  };
});
