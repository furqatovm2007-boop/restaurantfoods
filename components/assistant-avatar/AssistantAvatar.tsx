import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimationMixer, Box3, MathUtils, Vector3, type Object3D } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { lowEndDevice } from '../shared/device';

/** Returns the current mouth opening 0..1 (e.g. from an AnalyserNode). */
export type LevelSource = () => number;

export interface AssistantAvatarProps {
  src?: string;
  /** Read every frame while the assistant speaks; null when silent. */
  level?: React.RefObject<LevelSource | null>;
  /** Plays the authored gesture once. Bump to trigger again. */
  gesture?: number;
  paused?: boolean;
  onReady?: () => void;
  onError?: () => void;
}

/*
 * The Robot Playground rig swaps facial expressions by scaling expression joints (checked
 * against the skin weights in the GLB): `mouthClosKawai_056` carries the round "o" mouth,
 * `mouthClos_055` the closed line, `mouth_054` / `mouthClosHappy_057` the two smiles.
 * Lip-sync overrides those scales after the idle clip has been applied.
 */
const MOUTH_OPEN = 'mouthClosKawai_056';
const MOUTH_CLOSED = 'mouthClos_055';
const MOUTH_SMILES = ['mouth_054', 'mouthClosHappy_057'];
const HEAD = 'Head_M_033';

/** Smoothed amplitude of an analyser, mapped to a mouth opening 0..1. */
export function analyserLevel(analyser: AnalyserNode): LevelSource {
  const data = new Uint8Array(analyser.fftSize);
  let smooth = 0;
  return () => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    // Speech RMS sits around 0.02..0.25; a soft knee keeps pauses closed.
    const target = MathUtils.clamp((rms - 0.015) * 5.5, 0, 1);
    smooth += (target - smooth) * (target > smooth ? 0.55 : 0.25);
    return smooth;
  };
}

function Robot({ gltf, level, gesture, paused }: { gltf: GLTF; level?: AssistantAvatarProps['level']; gesture?: number; paused?: boolean }) {
  const { invalidate } = useThree();
  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf]);
  const clip = gltf.animations[0];
  const action = useMemo(() => (clip ? mixer.clipAction(clip) : null), [mixer, clip]);
  // Rig joints are mutated every frame, so they live in a ref rather than memoised state.
  const joints = useRef<{ open: Object3D | null; closed: Object3D | null; smiles: Object3D[]; head: Object3D | null } | null>(null);
  useEffect(() => {
    const find = (name: string) => gltf.scene.getObjectByName(name) ?? null;
    joints.current = { open: find(MOUTH_OPEN), closed: find(MOUTH_CLOSED), smiles: MOUTH_SMILES.map(find).filter(Boolean) as Object3D[], head: find(HEAD) };
  }, [gltf]);
  const mouth = useRef(0);
  // The host re-renders on speak/pause/gesture; demand mode needs a frame to pick that up.
  useEffect(() => {
    invalidate();
  });

  useEffect(() => {
    action?.play();
    return () => {
      mixer.stopAllAction();
    };
  }, [action, mixer]);

  useEffect(() => {
    if (!gesture || !action) return;
    action.reset().play();
    invalidate();
  }, [gesture, action, invalidate]);

  useFrame((_, delta) => {
    if (!paused) mixer.update(Math.min(delta, 0.1));
    const source = level?.current;
    const target = source ? source() : 0;
    mouth.current = MathUtils.damp(mouth.current, target, 18, delta);
    const open = mouth.current;
    const rig = joints.current;
    if (rig && (source || open > 0.01)) {
      if (rig.open) rig.open.scale.setScalar(open > 0.06 ? 0.35 + open * 0.9 : 0.0001);
      if (rig.closed) rig.closed.scale.setScalar(open > 0.06 ? 0.0001 : 1);
      for (const s of rig.smiles) s.scale.setScalar(0.0001);
      // A small nod follows the voice so the whole head feels alive.
      if (rig.head && !paused) rig.head.rotation.x += Math.sin(performance.now() / 140) * open * 0.035;
    }
    if (!paused || source) invalidate();
  });

  return <primitive object={gltf.scene} />;
}

/** Fits the camera to the model once it has loaded. */
function Frame({ object }: { object: Object3D }) {
  const { camera } = useThree();
  useEffect(() => {
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const distance = Math.max(size.y, size.x) * 1.55;
    camera.position.set(center.x, center.y + size.y * 0.08, center.z + distance);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [object, camera]);
  return null;
}

/**
 * Draco-compressed models (scripts/compress-avatar.mjs): ~2 MB full, ~0.8 MB lite instead of
 * the 8.7 MB original, which stays for the <model-viewer> fallback. The decoder is self-hosted.
 */
export const avatarModelUrl = () => (lowEndDevice() ? '/models/assistant-robot.lite.glb?v=1' : '/models/assistant-robot.draco.glb?v=1');

let draco: DRACOLoader | null = null;
const cache = new Map<string, Promise<GLTF>>();
function loadModel(src: string) {
  if (!cache.has(src)) {
    draco ??= new DRACOLoader().setDecoderPath('/draco/');
    const promise = new GLTFLoader().setDRACOLoader(draco).loadAsync(src);
    promise.catch(() => cache.delete(src));
    cache.set(src, promise);
  }
  return cache.get(src)!;
}

/**
 * Talking 3D assistant. The GLB plays its idle clip; while TTS audio plays, `level`
 * drives the mouth joints and a slight head nod in sync with the audio amplitude.
 */
export function AssistantAvatar({ src = avatarModelUrl(), level, gesture, paused, onReady, onError }: AssistantAvatarProps) {
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const callbacks = useRef({ onReady, onError });
  useEffect(() => {
    callbacks.current = { onReady, onError };
  });
  useEffect(() => {
    let alive = true;
    loadModel(src).then(
      (model) => {
        if (!alive) return;
        setGltf(model);
        callbacks.current.onReady?.();
      },
      () => alive && callbacks.current.onError?.(),
    );
    return () => {
      alive = false;
    };
  }, [src]);

  return (
    <Canvas resize={{ offsetSize: true }} flat dpr={[1, 2]} frameloop="demand" camera={{ fov: 30, near: 0.01, far: 100 }} gl={{ alpha: true, antialias: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[1.5, 2.5, 3]} intensity={2.4} />
      <directionalLight position={[-2, 1, -1]} intensity={0.8} color="#00c9a7" />
      {gltf && (
        <>
          <Robot gltf={gltf} level={level} gesture={gesture} paused={paused} />
          <Frame object={gltf.scene} />
        </>
      )}
    </Canvas>
  );
}

export default AssistantAvatar;
