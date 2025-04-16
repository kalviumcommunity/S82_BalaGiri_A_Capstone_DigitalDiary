import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Add this for React Router to prevent 404 on refresh
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    historyApiFallback: true, 
  }
});
