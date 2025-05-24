import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   mimeTypes: {
  //     // ensure wasm files have correct MIME type
  //     'application/wasm': ['wasm']
  //   }
  // }
})


import dotenv from "dotenv";
dotenv.config();

