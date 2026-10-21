import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CanvasTexture, MathUtils, SRGBColorSpace, Vector3, type Group } from 'three';

export type TableState = 'free' | 'booked' | 'occupied' | 'unavailable';

export interface HallTable {
  number: number;
  floor: number;
  seats: number;
  /** Floor-plan position in percent (0..100) from the left / top wall. */
  x: number;
  y: number;
  shape: 'round' | 'rectangle' | string;
}

export interface Hall3DProps {
  tables: HallTable[];
  /** Hall size in metres; derived from the table count when unknown. */
  width?: number | null;
  length?: number | null;
  floor?: number;
  states: Record<number, TableState>;
  selected?: number | null;
  /** Minimum seats the party needs; smaller tables are dimmed. */
  guests?: number;
  onSelect?: (table: number) => void;
  lang?: string;
  className?: string;
}

const COLORS: Record<TableState | 'selected', string> = {
  free: '#00c9a7',
  booked: '#e0697a',
  occupied: '#f0a35e',
  unavailable: '#4b6470',
  selected: '#e0c791',
};

const LEGEND: Record<string, Record<TableState | 'selected', string>> = {
  uz: { free: 'Bo‘sh', booked: 'Band (bron)', occupied: 'Hozir band', unavailable: 'Mos emas', selected: 'Tanlangan' },
  ru: { free: 'Свободен', booked: 'Забронирован', occupied: 'Сейчас занят', unavailable: 'Не подходит', selected: 'Выбран' },
  en: { free: 'Free', booked: 'Booked', occupied: 'In use now', unavailable: 'Not suitable', selected: 'Selected' },
};

function numberTexture(n: number) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#081521';
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e0c791';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 60px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), 64, 68);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function TableMesh({ table, w, l, state, selected, small, onSelect }: { table: HallTable; w: number; l: number; state: TableState; selected: boolean; small: boolean; onSelect?: (n: number) => void }) {
  const group = useRef<Group>(null);
  const label = useMemo(() => numberTexture(table.number), [table.number]);
  useEffect(() => () => label.dispose(), [label]);
  const round = table.shape !== 'rectangle';
  // Table size grows with seats: ~0.9 m for two, ~2.2 m for ten.
  const size = Math.min(2.4, 0.7 + table.seats * 0.17);
  const depth = round ? size : Math.max(0.8, size * 0.55);
  const x = (table.x / 100 - 0.5) * w;
  const z = (table.y / 100 - 0.5) * l;
  const pickable = state === 'free' && !small;
  const color = selected ? COLORS.selected : small && state === 'free' ? COLORS.unavailable : COLORS[state];
  const { invalidate } = useThree();

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const target = selected ? 0.12 : 0;
    g.position.y = MathUtils.damp(g.position.y, target, 8, delta);
    if (Math.abs(g.position.y - target) > 0.001) invalidate();
  });

  const chairs = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let i = 0; i < table.seats; i++) {
      if (round) {
        const a = (i / table.seats) * Math.PI * 2;
        list.push([Math.cos(a) * (size / 2 + 0.3), Math.sin(a) * (size / 2 + 0.3), -a]);
      } else {
        const side = i % 2 === 0 ? -1 : 1;
        const perSide = Math.ceil(table.seats / 2);
        const slot = Math.floor(i / 2);
        list.push([(-size / 2 + (size / perSide) * (slot + 0.5)), side * (depth / 2 + 0.3), 0]);
      }
    }
    return list;
  }, [table.seats, round, size, depth]);

  // Clicks only: a drag that starts on a table orbits the camera instead of selecting it.
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (pickable && e.delta < 6) onSelect?.(table.number);
  };
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.nativeEvent.target as HTMLElement).style.cursor = pickable ? 'pointer' : 'not-allowed';
  };
  const out = (e: ThreeEvent<PointerEvent>) => ((e.nativeEvent.target as HTMLElement).style.cursor = '');

  return (
    <group ref={group} position={[x, 0, z]} onClick={click} onPointerOver={over} onPointerOut={out}>
      {round ? (
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[size / 2, size / 2, 0.06, 40]} />
          <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={selected ? 0.35 : 0.08} />
        </mesh>
      ) : (
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[size, 0.06, depth]} />
          <meshStandardMaterial color={color} roughness={0.45} emissive={color} emissiveIntensity={selected ? 0.35 : 0.08} />
        </mesh>
      )}
      <mesh position={[0, 0.37, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.72, 12]} />
        <meshStandardMaterial color="#1c3440" roughness={0.6} />
      </mesh>
      {chairs.map(([cx, cz, rot], i) => (
        <group key={i} position={[cx, 0, cz]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.42, 0.06, 0.42]} />
            <meshStandardMaterial color="#d8ccb4" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.05, 0.44, 0.05]} />
            <meshStandardMaterial color="#1c3440" />
          </mesh>
        </group>
      ))}
      <sprite position={[0, 1.35, 0]} scale={[0.55, 0.55, 0.55]}>
        <spriteMaterial map={label} depthTest={false} />
      </sprite>
    </group>
  );
}

/** Drag to orbit, wheel / pinch to zoom; the camera always looks at the hall centre. */
function OrbitRig({ radius }: { radius: number }) {
  const { gl, invalidate } = useThree();
  const view = useRef({ azimuth: 0.35, polar: 0.95, distance: radius * 1.05, target: { azimuth: 0.35, polar: 0.9, distance: radius * 1.05 } });

  useEffect(() => {
    const el = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const t = view.current.target;
    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) t.distance = MathUtils.clamp(t.distance * (pinch / d), radius * 0.5, radius * 2.4);
        pinch = d;
      } else {
        t.azimuth -= (e.clientX - prev.x) * 0.006;
        t.polar = MathUtils.clamp(t.polar - (e.clientY - prev.y) * 0.004, 0.35, 1.35);
      }
      invalidate();
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      t.distance = MathUtils.clamp(t.distance * (1 + Math.sign(e.deltaY) * 0.1), radius * 0.5, radius * 2.4);
      invalidate();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [gl, invalidate, radius]);

  const scratch = useMemo(() => new Vector3(), []);
  useFrame((state, delta) => {
    const v = view.current;
    v.azimuth = MathUtils.damp(v.azimuth, v.target.azimuth, 8, delta);
    v.polar = MathUtils.damp(v.polar, v.target.polar, 8, delta);
    v.distance = MathUtils.damp(v.distance, v.target.distance, 8, delta);
    scratch.setFromSphericalCoords(v.distance, v.polar, v.azimuth);
    state.camera.position.copy(scratch);
    state.camera.lookAt(0, 0.4, 0);
    if (Math.abs(v.azimuth - v.target.azimuth) + Math.abs(v.polar - v.target.polar) + Math.abs(v.distance - v.target.distance) > 1e-3) invalidate();
  });
  return null;
}

/**
 * 3D view of the dining hall: tables from the owner's floor plan, coloured by booking
 * and live occupancy. Free tables that fit the party can be picked for a reservation.
 */
export function Hall3D({ tables, width, length, floor = 1, states, selected, guests = 1, onSelect, lang = 'uz', className = '' }: Hall3DProps) {
  const visible = tables.filter((t) => t.floor === floor);
  const side = Math.ceil(Math.sqrt(Math.max(1, visible.length)));
  const w = width ?? Math.max(8, side * 3.2);
  const l = length ?? Math.max(8, side * 3.2);
  const radius = Math.max(w, l);
  const legend = LEGEND[lang] ?? LEGEND.uz;
  const [reduced] = useState(() => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  return (
    <div className={`rf:relative rf:h-[min(62vh,520px)] rf:w-full rf:touch-none rf:overflow-hidden rf:rounded-2xl rf:border rf:border-line rf:bg-night ${className}`}>
      <Canvas shadows="percentage" dpr={[1, 2]} frameloop="demand" camera={{ fov: 42, near: 0.1, far: 200, position: [radius, radius, radius] }} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#0b1c28']} />
        <fog attach="fog" args={['#0b1c28', radius * 1.8, radius * 3.5]} />
        <hemisphereLight args={['#fff4e0', '#102635', 1.1]} />
        <directionalLight position={[w * 0.3, 12, l * 0.4]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-radius} shadow-camera-right={radius} shadow-camera-top={radius} shadow-camera-bottom={-radius} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, l]} />
          <meshStandardMaterial color="#3a2f26" roughness={0.85} />
        </mesh>
        {/* Low walls keep the plan readable from every angle. */}
        {[
          [0, -l / 2, w, 0.12],
          [0, l / 2, w, 0.12],
          [-w / 2, 0, 0.12, l],
          [w / 2, 0, 0.12, l],
        ].map(([x, z, sx, sz], i) => (
          <mesh key={i} position={[x, 0.5, z]} receiveShadow>
            <boxGeometry args={[sx, 1, sz]} />
            <meshStandardMaterial color="#153242" roughness={0.7} />
          </mesh>
        ))}
        {visible.map((t) => (
          <TableMesh key={t.number} table={t} w={w} l={l} state={states[t.number] ?? 'free'} selected={selected === t.number} small={t.seats < guests} onSelect={onSelect} />
        ))}
        <OrbitRig radius={reduced ? radius * 1.1 : radius} />
      </Canvas>
      <ul className="rf:pointer-events-none rf:absolute rf:bottom-2 rf:left-2 rf:m-0 rf:flex rf:list-none rf:flex-wrap rf:gap-1.5 rf:p-0 rf:text-[11px] rf:text-text">
        {(['free', 'booked', 'occupied', 'selected'] as const).map((k) => (
          <li key={k} className="rf:flex rf:items-center rf:gap-1.5 rf:rounded-full rf:bg-night/80 rf:px-2 rf:py-1">
            <span className="rf:inline-block rf:size-2.5 rf:rounded-full" style={{ background: COLORS[k] }} />
            {legend[k]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Hall3D;
