/*
 * Person detector for Smart Vision, built into public/rf-vision.js and loaded only on the camera
 * page. TensorFlow.js runs coco-ssd on the device (WebGL, CPU fallback); the video never leaves
 * the browser. The model is self-hosted under /models/coco-ssd/ so the CSP stays 'self'.
 */
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import { load } from '@tensorflow-models/coco-ssd';

export interface Person {
  /** [x, y, width, height] in video pixels. */
  bbox: [number, number, number, number];
  score: number;
}

async function createDetector(minScore = 0.5) {
  if (!(await tf.setBackend('webgl').catch(() => false))) await tf.setBackend('cpu');
  await tf.ready();
  const model = await load({ base: 'lite_mobilenet_v2', modelUrl: '/models/coco-ssd/model.json' });
  return {
    backend: tf.getBackend(),
    async detect(source: HTMLVideoElement | HTMLCanvasElement): Promise<Person[]> {
      const found = await model.detect(source, 20, minScore);
      return found.filter((p) => p.class === 'person').map((p) => ({ bbox: p.bbox as Person['bbox'], score: p.score }));
    },
    /** People and dining tables in one pass (tables are found with a lower threshold: they are often half hidden). */
    async detectAll(source: HTMLVideoElement | HTMLCanvasElement, tableScore = 0.3): Promise<{ people: Person[]; tables: Person[] }> {
      const found = await model.detect(source, 40, Math.min(minScore, tableScore));
      const pick = (cls: string, min: number) => found.filter((p) => p.class === cls && p.score >= min).map((p) => ({ bbox: p.bbox as Person['bbox'], score: p.score }));
      return { people: pick('person', minScore), tables: pick('dining table', tableScore) };
    },
    dispose: () => model.dispose(),
  };
}

(window as unknown as { RFVision: unknown }).RFVision = { createDetector };
