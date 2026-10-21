import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  CanvasTexture,
  DoubleSide,
  FrontSide,
  BackSide,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type DirectionalLight,
} from 'three';
import { bendSheet, createSheetGeometry } from './page-bend';
import { drawPage, hitTest, PAGE_ASPECT, type ImageCache } from './page-canvas';
import { palette } from './theme';
import type { BookLabels, BookPage, BookSheet, Hotspot, HotspotAction } from './types';

export const PAGE_WIDTH = 1;
export const PAGE_HEIGHT = PAGE_WIDTH * PAGE_ASPECT;
const COVER_SCALE = { x: 1.03, y: 1.035 };
const SHEET_GAP = 0.0035;
const PAPER_CURL = 1.05;
const DRAG_CURL = 0.75;
const TURN_SECONDS = 0.72;
const COVER_SECONDS = 0.9;
const STAGGER_SECONDS = 0.07;
/** Sheets kept textured around the open spread; the rest show blank paper. */
const TEXTURE_WINDOW = { before: 2, after: 1 };

export interface BookSceneProps {
  sheets: BookSheet[];
  spread: number;
  narrow: boolean;
  focus: 'left' | 'right';
  reducedMotion: boolean;
  restaurantName: string;
  labels: BookLabels;
  quantities: Record<string, number>;
  flashed: ReadonlySet<string>;
  images: ImageCache;
  /** Bumped when fonts or photos finish loading so pages are repainted. */
  assetsVersion: number;
  folioOf: (page: number) => number | null;
  onSpreadChange: (spread: number) => void;
  onAction: (action: HotspotAction) => void;
}

interface SheetMotion {
  t: number;
  from: number;
  to: number;
  start: number;
  duration: number;
  direction: 1 | -1;
  dragging: boolean;
}

interface PageSlot {
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  hotspots: Hotspot[];
  key: string;
}

interface Drag {
  sheet: number;
  /** Book-space x where the pointer went down. */
  origin: number;
  pointerId: number;
  grab: number;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
  page: BookPage;
  uv: Vector2;
}

const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/** A repaint key so a page canvas is redrawn only when something it shows changed. */
function pageKey(page: BookPage, quantities: Record<string, number>, flashed: ReadonlySet<string>, version: number) {
  if (page.content.kind !== 'dishes') return `${version}`;
  return version + page.content.dishes.map((d) => `|${d.id}:${quantities[d.id] ?? 1}:${flashed.has(d.id) ? 1 : 0}`).join('');
}

export function BookScene(props: BookSceneProps) {
  const { sheets, spread, narrow, focus, reducedMotion } = props;
  const { camera, gl, size, invalidate } = useThree();
  const book = useRef<Group>(null);
  const light = useRef<DirectionalLight>(null);
  const count = sheets.length;
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  });

  /* ---------------------------------------------------------- GPU objects */

  const blank = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = palette.paper;
    ctx.fillRect(0, 0, 4, 4);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);

  const meshes = useMemo(
    () =>
      sheets.map((sheet) => {
        const w = sheet.rigid ? PAGE_WIDTH * COVER_SCALE.x : PAGE_WIDTH;
        const h = sheet.rigid ? PAGE_HEIGHT * COVER_SCALE.y : PAGE_HEIGHT;
        const geometry = createSheetGeometry(w, h);
        const material = (side: typeof FrontSide | typeof BackSide) =>
          new MeshStandardMaterial({ map: blank, side, roughness: sheet.rigid ? 0.62 : 0.9, metalness: 0 });
        return { sheet, geometry, front: material(FrontSide), back: material(BackSide), width: w, height: h };
      }),
    [sheets, blank],
  );

  const blocks = useMemo(() => {
    const geometry = new BoxGeometry(PAGE_WIDTH * 0.992, PAGE_HEIGHT * 0.99, 1);
    const material = new MeshStandardMaterial({ color: '#e6dcc8', roughness: 0.95 });
    return { geometry, material };
  }, []);

  const shadowCatcher = useMemo(() => new PlaneGeometry(8, 6), []);

  // Per-sheet animation state lives outside React: it changes every frame.
  const motionRef = useRef<{ sheets: BookSheet[]; list: SheetMotion[]; fresh: boolean } | null>(null);
  const motionOf = useCallback(() => {
    if (motionRef.current?.sheets !== sheets) {
      const list = sheets.map((): SheetMotion => ({ t: 0, from: 0, to: 0, start: 0, duration: 0, direction: 1, dragging: false }));
      motionRef.current = { sheets, list, fresh: true };
    }
    return motionRef.current;
  }, [sheets]);

  const slots = useRef(new Map<number, PageSlot>());
  const texWidth = narrow ? 720 : 1024;
  const anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

  useEffect(
    () => () => {
      meshes.forEach((m) => {
        m.geometry.dispose();
        m.front.dispose();
        m.back.dispose();
      });
    },
    [meshes],
  );
  useEffect(
    () => () => {
      blocks.geometry.dispose();
      blocks.material.dispose();
      shadowCatcher.dispose();
      blank.dispose();
      slots.current.forEach((s) => s.texture.dispose());
      slots.current.clear();
    },
    [blocks, shadowCatcher, blank],
  );

  /* ------------------------------------------------------ page textures */

  useEffect(() => {
    const { quantities, flashed, assetsVersion, restaurantName, labels, images, folioOf } = props;
    const wanted = new Set<number>();
    const lo = Math.max(0, spread - 1 - TEXTURE_WINDOW.before);
    const hi = Math.min(count - 1, spread + TEXTURE_WINDOW.after);
    for (let i = lo; i <= hi; i++) wanted.add(i);
    // Covers stay painted so the closed book is never blank.
    wanted.add(0);
    wanted.add(count - 1);
    motionOf().list.forEach((m, i) => m.t !== m.to && wanted.add(i));

    const paint = (page: BookPage, side: 'left' | 'right') => {
      const key = pageKey(page, quantities, flashed, assetsVersion) + texWidth;
      let slot = slots.current.get(page.index);
      if (slot?.key === key) return slot;
      if (!slot || slot.canvas.width !== texWidth) {
        slot?.texture.dispose();
        const canvas = document.createElement('canvas');
        canvas.width = texWidth;
        canvas.height = Math.round(texWidth * PAGE_ASPECT);
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = anisotropy;
        if (side === 'left') {
          // Back faces see the plane's UVs mirrored; flip so the page reads correctly.
          texture.repeat.set(-1, 1);
          texture.offset.set(1, 0);
        }
        slot = { canvas, texture, hotspots: [], key: '' };
        slots.current.set(page.index, slot);
      }
      slot.hotspots = drawPage(slot.canvas, page, { restaurantName, labels, quantities, flashed, images, side }, folioOf);
      slot.key = key;
      slot.texture.needsUpdate = true;
      return slot;
    };

    meshes.forEach((m, i) => {
      if (wanted.has(i)) {
        m.front.map = paint(m.sheet.front, 'right').texture;
        m.back.map = paint(m.sheet.back, 'left').texture;
      } else {
        for (const page of [m.sheet.front, m.sheet.back]) {
          slots.current.get(page.index)?.texture.dispose();
          slots.current.delete(page.index);
        }
        m.front.map = blank;
        m.back.map = blank;
      }
    });
    invalidate();
  }, [props.quantities, props.flashed, props.assetsVersion, props.restaurantName, props.labels, spread, meshes, count, texWidth, motionOf]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------------------------------------------------- turn motion */

  useEffect(() => {
    const now = performance.now() / 1000;
    const state = motionOf();
    // The first layout (mount or new menu data) snaps into place without animating.
    const instant = reducedMotion || state.fresh;
    state.fresh = false;
    const motion = state.list;
    const changed = motion.flatMap((m, i) => (m.to !== (i < spread ? 1 : 0) ? [i] : []));
    // All changed sheets travel the same way: forward jumps lift them front-to-back, backward ones in reverse.
    if (changed.length && changed[0] >= spread) changed.reverse();
    changed.forEach((i, order) => {
      const m = motion[i];
      const target = i < spread ? 1 : 0;
      const base = sheets[i].rigid ? COVER_SECONDS : TURN_SECONDS;
      m.from = m.t;
      m.to = target;
      m.dragging = false;
      m.direction = target > m.t ? 1 : -1;
      m.start = now + Math.min(order * STAGGER_SECONDS, 0.6);
      m.duration = instant ? 0 : Math.max(0.25, base * Math.abs(target - m.t)) * (changed.length > 3 ? 0.75 : 1);
    });
    invalidate();
  }, [spread, sheets, reducedMotion, invalidate, motionOf]);

  /* --------------------------------------------------------- per frame */

  const raycaster = useMemo(() => new Raycaster(), []);
  const bookPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const scratch = useMemo(() => ({ v: new Vector3(), target: new Vector3(), look: new Vector3() }), []);

  useFrame((frame, delta) => {
    const now = performance.now() / 1000;
    const motion = motionOf().list;
    let busy = false;

    meshes.forEach((m, i) => {
      const state = motion[i];
      if (!state.dragging && state.t !== state.to) {
        const k = state.duration === 0 ? 1 : MathUtils.clamp((now - state.start) / state.duration, 0, 1);
        state.t = k >= 1 ? state.to : state.from + (state.to - state.from) * easeInOut(k);
        busy = true;
      }
      const restRight = (count - 1 - i) * SHEET_GAP;
      const restLeft = i * SHEET_GAP;
      const curl = m.sheet.rigid ? 0 : state.dragging ? DRAG_CURL : PAPER_CURL;
      const key = `${state.t}|${curl}|${state.direction}`;
      if (m.geometry.userData.key !== key) {
        bendSheet(m.geometry, {
          progress: state.t,
          curl,
          direction: state.direction,
          lift: MathUtils.lerp(restRight, restLeft, state.t) + 0.004,
          width: m.width,
          height: m.height,
        });
        m.geometry.userData.key = key;
      }
    });

    // Book block thickness under each stack.
    const turned = motion.filter((m) => m.t > 0.5).length;
    const group = book.current;
    if (group) {
      const left = group.getObjectByName('block-left') as Mesh | undefined;
      const right = group.getObjectByName('block-right') as Mesh | undefined;
      const leftDepth = Math.max(0.0001, (Math.min(turned, count - 1) - 1) * SHEET_GAP);
      const rightDepth = Math.max(0.0001, (count - 1 - Math.max(turned, 1)) * SHEET_GAP);
      if (left) {
        left.scale.z = leftDepth;
        left.position.z = leftDepth / 2;
        left.visible = turned > 1;
      }
      if (right) {
        right.scale.z = rightDepth;
        right.position.z = rightDepth / 2;
        right.visible = turned < count - 1;
      }

      // Closed books sit centred; an open book centres on its spine.
      const closedFront = spread === 0;
      const closedBack = spread === count;
      const targetX = closedFront ? -PAGE_WIDTH / 2 : closedBack ? PAGE_WIDTH / 2 : 0;
      const nextX = MathUtils.damp(group.position.x, targetX, 5, delta);
      if (Math.abs(nextX - targetX) > 1e-4) busy = true;
      group.position.x = Math.abs(nextX - targetX) > 1e-4 ? nextX : targetX;
    }

    // Camera framing: whole spread on wide screens, a single page on phones.
    const cam = frame.camera as PerspectiveCamera;
    const open = spread > 0 && spread < count;
    const fitWidth = (open && !narrow ? PAGE_WIDTH * 2 : PAGE_WIDTH) * (narrow ? 1.08 : 1.14);
    const fitHeight = PAGE_HEIGHT * (narrow ? 1.06 : 1.14);
    const halfFov = MathUtils.degToRad(cam.fov / 2);
    const distance = Math.max(fitHeight / (2 * Math.tan(halfFov)), fitWidth / (2 * Math.tan(halfFov) * cam.aspect));
    const focusX = narrow && open ? (focus === 'left' ? -PAGE_WIDTH / 2 : PAGE_WIDTH / 2) : 0;
    scratch.target.set(focusX, -0.06, distance);
    const before = cam.position.distanceToSquared(scratch.target);
    cam.position.x = MathUtils.damp(cam.position.x, scratch.target.x, 5, delta);
    cam.position.y = MathUtils.damp(cam.position.y, scratch.target.y, 5, delta);
    cam.position.z = MathUtils.damp(cam.position.z, scratch.target.z, 5, delta);
    scratch.look.set(cam.position.x, 0, 0);
    cam.lookAt(scratch.look);
    if (before > 1e-7) busy = true;

    if (busy) invalidate();
  });

  /* ------------------------------------------------------- interaction */

  const localX = (clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const group = book.current!;
    group.updateWorldMatrix(true, false);
    const ray = raycaster.ray.clone().applyMatrix4(group.matrixWorld.clone().invert());
    return ray.intersectPlane(bookPlane, scratch.v)?.x ?? null;
  };

  const drag = useRef<Drag | null>(null);

  const hotspotAt = (page: BookPage, uv: Vector2, side: 'left' | 'right') => {
    const slot = slots.current.get(page.index);
    // Back faces are mirrored, see the texture set-up above.
    const x = side === 'left' ? 1 - uv.x : uv.x;
    return hitTest(slot?.hotspots, x, 1 - uv.y);
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 8) return;
      const x = localX(e.clientX, e.clientY);
      if (x === null) return;
      const now = performance.now();
      if (now > d.lastTime) {
        d.velocity = MathUtils.lerp(d.velocity, (x - d.lastX) / ((now - d.lastTime) / 1000), 0.5);
        d.lastX = x;
        d.lastTime = now;
      }
      d.moved = true;
      const m = motionOf().list[d.sheet];
      m.dragging = true;
      // The grabbed point follows the pointer: x = grab·W·cos(t·π). Phones show one page,
      // so a full-width swipe is amplified to reach the opposite stack.
      const reach = latest.current.narrow ? d.origin + (x - d.origin) * 2 : x;
      const t = Math.acos(MathUtils.clamp(reach / (d.grab * PAGE_WIDTH), -1, 1)) / Math.PI;
      m.direction = t >= m.t ? 1 : -1;
      m.t = MathUtils.clamp(t, 0, 1);
      invalidate();
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      drag.current = null;
      const m = motionOf().list[d.sheet];
      const { spread: current, onSpreadChange, onAction } = latest.current;
      if (!d.moved) {
        m.dragging = false;
        const hit = hotspotAt(d.page, d.uv, d.sheet < current ? 'left' : 'right');
        if (hit) onAction(hit.action);
        return;
      }
      const forwardDrag = d.sheet === current;
      const fling = Math.abs(d.velocity) > 1.2;
      const commit = forwardDrag ? m.t > 0.5 || (fling && d.velocity < 0 && m.t > 0.08) : m.t < 0.5 || (fling && d.velocity > 0 && m.t < 0.92);
      m.dragging = false;
      if (commit) {
        onSpreadChange(forwardDrag ? current + 1 : current - 1);
      } else {
        // Let go too early: the paper falls back where it was.
        const now = performance.now() / 1000;
        m.from = m.t;
        m.to = forwardDrag ? 0 : 1;
        m.direction = forwardDrag ? -1 : 1;
        m.start = now;
        m.duration = reducedMotion ? 0 : 0.35;
      }
      invalidate();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }); // re-bound each render so handlers see fresh camera/size

  const onDown = (sheetIndex: number, side: 'left' | 'right') => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.button !== 0 || drag.current) return;
    const sheet = sheets[sheetIndex];
    // Only the top sheet of each stack can be picked up, and not while it is still moving.
    const top = side === 'right' ? sheetIndex === spread : sheetIndex === spread - 1;
    const m = motionOf().list[sheetIndex];
    if (!top || m.t !== m.to || !e.uv) return;
    const x = localX(e.clientX, e.clientY) ?? 0;
    drag.current = {
      sheet: sheetIndex,
      origin: x,
      pointerId: e.pointerId,
      grab: MathUtils.clamp(Math.abs(x) / PAGE_WIDTH, 0.45, 1),
      startX: e.clientX,
      startY: e.clientY,
      startTime: performance.now(),
      lastX: x,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
      page: side === 'right' ? sheet.front : sheet.back,
      uv: e.uv.clone(),
    };
  };

  const resetCursor = (e: ThreeEvent<PointerEvent>) => {
    (e.nativeEvent.target as HTMLElement).style.cursor = '';
  };

  const onHover = (sheetIndex: number, side: 'left' | 'right') => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const canvas = e.nativeEvent.target as HTMLElement;
    if (drag.current?.moved) {
      canvas.style.cursor = 'grabbing';
      return;
    }
    const sheet = sheets[sheetIndex];
    const top = side === 'right' ? sheetIndex === spread : sheetIndex === spread - 1;
    const hit = top && e.uv ? hotspotAt(side === 'right' ? sheet.front : sheet.back, e.uv, side) : null;
    canvas.style.cursor = hit ? 'pointer' : top ? 'grab' : '';
  };

  useEffect(() => {
    if (light.current) {
      light.current.shadow.mapSize.set(2048, 2048);
      light.current.shadow.bias = -0.0004;
      light.current.shadow.normalBias = 0.02;
      const cam = light.current.shadow.camera;
      cam.left = -1.6;
      cam.right = 1.6;
      cam.top = 1.2;
      cam.bottom = -1.2;
      cam.near = 0.1;
      cam.far = 8;
      cam.updateProjectionMatrix();
    }
    invalidate();
  }, [invalidate, size.width, size.height]);

  return (
    <>
      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#fff7e8', '#0b2a27', 0.55]} />
      <directionalLight ref={light} position={[-1.4, 1.6, 3.2]} intensity={1.6} castShadow />
      <group ref={book} rotation={[narrow ? -0.2 : -0.32, 0, 0]}>
        <mesh geometry={shadowCatcher} position={[0, 0, -0.012]} receiveShadow>
          <shadowMaterial opacity={0.32} transparent side={DoubleSide} />
        </mesh>
        <mesh name="block-left" geometry={blocks.geometry} material={blocks.material} position={[-PAGE_WIDTH * 0.496, 0, 0]} castShadow receiveShadow />
        <mesh name="block-right" geometry={blocks.geometry} material={blocks.material} position={[PAGE_WIDTH * 0.496, 0, 0]} castShadow receiveShadow />
        {meshes.map((m, i) => (
          <group key={m.sheet.index}>
            <mesh
              geometry={m.geometry}
              material={m.front}
              castShadow
              receiveShadow
              onPointerDown={onDown(i, 'right')}
              onPointerMove={onHover(i, 'right')}
              onPointerOut={resetCursor}
            />
            <mesh
              geometry={m.geometry}
              material={m.back}
              castShadow
              receiveShadow
              onPointerDown={onDown(i, 'left')}
              onPointerMove={onHover(i, 'left')}
              onPointerOut={resetCursor}
            />
          </group>
        ))}
      </group>
    </>
  );
}
