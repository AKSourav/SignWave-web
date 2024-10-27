// vite.config.js
import { mediapipe } from 'vite-plugin-mediapipe';

import react from '@vitejs/plugin-react-swc';

// default options
export default defineConfig({
	plugins: [
		mediapipe(),
    react()
	]
});
