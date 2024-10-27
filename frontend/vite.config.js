import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@mediapipe/hands', '@mediapipe/drawing_utils'], // Include both hands and drawing utils
  },
  build: {
    rollupOptions: {
      // Ensure external dependencies are included properly
      external: ['@mediapipe/hands', '@mediapipe/drawing_utils'], // Marking as external to avoid bundling issues
    },
  },
  resolve: {
    alias: {
      // Add any necessary aliases here if needed
    },
  },
});
