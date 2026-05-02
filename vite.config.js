import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
    proxy: {
      // This forwards frontend API calls to your FastAPI backend
      '/api': {
        target: 'https://ccissportal-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
});