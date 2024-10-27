import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mediapipe/hands']
  },
  resolve: {
    alias: {
      '@mediapipe/hands': '@mediapipe/hands'  // Adjust if aliasing is needed
    }
  }
});
