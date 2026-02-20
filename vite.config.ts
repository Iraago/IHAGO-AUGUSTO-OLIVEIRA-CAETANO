import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (como API_KEY) do sistema ou arquivo .env
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Garante que process.env.API_KEY funcione no código cliente após o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});