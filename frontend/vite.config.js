import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import frameSink from './render/frameSink.js';

export default defineConfig({
  plugins: [react(), frameSink()],
  server: { port: 5173 },
  optimizeDeps: { include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', '@react-three/fiber', 'three', 'gsap', 'gsap/ScrollTrigger', 'lenis'] },
});
