// vite.config.js
import { defineConfig } from 'vite';
import { mediapipe } from 'vite-plugin-mediapipe';

import react from '@vitejs/plugin-react-swc';

// default options
export default defineConfig({
	plugins: [
		mediapipe(),
    react()
	]
});
