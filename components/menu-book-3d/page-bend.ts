import { PlaneGeometry } from 'three';

export const SEGMENTS_X = 40;
export const SEGMENTS_Y = 8;

/** Plane whose left edge (u = 0) sits on the spine at x = 0. */
export function createSheetGeometry(width: number, height: number): PlaneGeometry {
  const geometry = new PlaneGeometry(width, height, SEGMENTS_X, SEGMENTS_Y);
  geometry.translate(width / 2, 0, 0);
  return geometry;
}

export interface BendParams {
  /** 0 = lying on the right stack, 1 = lying on the left stack. */
  progress: number;
  /** How much the paper bows mid-turn (radians at the free edge). 0 for rigid boards. */
  curl: number;
  /** +1 while turning forward (right → left), -1 backwards. The free edge lags behind the spine. */
  direction: 1 | -1;
  /** Resting height above the book block, keeps stacked sheets from z-fighting. */
  lift: number;
  width: number;
  height: number;
}

const clampAngle = (a: number) => (a < 0.002 ? 0.002 : a > Math.PI - 0.002 ? Math.PI - 0.002 : a);

/**
 * Bends the sheet like real paper: the spine rotates by progress·π while the
 * angle keeps changing along the page, so the sheet forms a smooth arc.
 * Each row is integrated separately, letting the lower corner lead slightly.
 */
export function bendSheet(geometry: PlaneGeometry, p: BendParams) {
  const position = geometry.attributes.position;
  const array = position.array as Float32Array;
  const cols = SEGMENTS_X + 1;
  const ds = p.width / SEGMENTS_X;
  const theta = p.progress * Math.PI;
  const bow = Math.sin(p.progress * Math.PI) * p.curl;

  for (let row = 0; row <= SEGMENTS_Y; row++) {
    const v = row / SEGMENTS_Y; // 0 = top edge, 1 = bottom edge (PlaneGeometry order)
    let x = 0;
    let z = 0;
    for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 3;
      array[i] = x;
      array[i + 2] = z + p.lift;
      const u = (col + 0.5) / SEGMENTS_X;
      // Paper near the spine leads the turn, the free edge trails and the bottom corner peels first.
      const shape = 0.45 - u * u * 1.15 + (v - 0.5) * 0.28 * u;
      const phi = clampAngle(theta + bow * shape * p.direction);
      x += Math.cos(phi) * ds;
      z += Math.sin(phi) * ds;
    }
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}
