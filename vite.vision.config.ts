import { defineConfig } from 'vite';

/** Standalone browser bundle for Smart Vision: TensorFlow.js + coco-ssd person detection. */
export default defineConfig({
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    copyPublicDir: false,
    sourcemap: false,
    lib: { entry: 'components/smart-vision/detector.ts', name: 'RFVisionBundle', formats: ['iife'], fileName: () => 'rf-vision.js' },
  },
});
