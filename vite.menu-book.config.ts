import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/*
 * three r183 deprecated THREE.Clock in favour of THREE.Timer, but @react-three/fiber 9.x
 * (latest stable) still creates `new THREE.Clock()` for its root store, which logs a
 * deprecation warning on every page that mounts a canvas. This swaps in a Timer-backed
 * object with the Clock API R3F uses (start/stop/getDelta/getElapsedTime, elapsedTime,
 * oldTime, running, autoStart). Remove once R3F ships with Timer.
 */
const TIMER_CLOCK = `
class __RFTimerClock {
  constructor(autoStart = true) {
    this.timer = new THREE.Timer();
    this.autoStart = autoStart;
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.running = false;
  }
  start() {
    this.timer.reset();
    this.startTime = this.oldTime = performance.now();
    this.elapsedTime = 0;
    this.running = true;
  }
  stop() {
    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;
  }
  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }
  getDelta() {
    if (this.autoStart && !this.running) {
      this.start();
      return 0;
    }
    if (!this.running) return 0;
    this.timer.update();
    const delta = this.timer.getDelta();
    this.oldTime = performance.now();
    this.elapsedTime += delta;
    return delta;
  }
}
`;

function r3fTimerClock(): Plugin {
  return {
    name: 'rf-r3f-timer-clock',
    transform(code, id) {
      if (!id.includes('@react-three/fiber') || !code.includes('new THREE.Clock()')) return null;
      const anchor = "import * as THREE from 'three';";
      if (!code.includes(anchor)) this.error('R3F changed its three import; update vite.menu-book.config.ts');
      return code.replace(anchor, anchor + TIMER_CLOCK).replaceAll('new THREE.Clock()', 'new __RFTimerClock()');
    },
  };
}

/*
 * DRACOLoader points its default decoder URLs at three/examples via import.meta.url, which a
 * library build inlines as ~1.8 MB of base64. The avatar sets /draco/ (self-hosted copies of
 * three/examples/jsm/libs/draco/gltf), so the defaults are replaced with that path.
 */
function dracoDecoderPaths(): Plugin {
  return {
    name: 'rf-draco-decoder-paths',
    transform(code, id) {
      if (!id.includes('DRACOLoader')) return null;
      const out = code.replace(/new URL\(\s*'\.\.\/libs\/draco\/(?:gltf\/)?([\w.]+)',\s*import\.meta\.url\s*\)\.toString\(\)/g, (_, file) => JSON.stringify('/draco/' + file));
      if (out.includes('import.meta.url')) this.error('DRACOLoader decoder URLs changed; update vite.menu-book.config.ts');
      return out;
    },
  };
}

/** Standalone browser bundle for the 3D features (React + R3F island): menu book, hall, avatar, admin orb. */
export default defineConfig({
  plugins: [react(), r3fTimerClock(), dracoDecoderPaths()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    copyPublicDir: false,
    sourcemap: false,
    lib: {
      entry: 'components/menu-book-3d/island.tsx',
      name: 'RF3DBundle',
      formats: ['iife'],
      fileName: () => 'rf-3d.js',
      cssFileName: 'rf-3d',
    },
  },
});
