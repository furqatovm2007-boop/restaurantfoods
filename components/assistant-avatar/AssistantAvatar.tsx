import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimationMixer, Box3, MathUtils, Quaternion, Vector3, type Object3D } from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { canvasDpr, lowEndDevice, useOnScreen } from '../shared/device';

/** Returns the current mouth opening 0..1 (e.g. from an AnalyserNode). */
export type LevelSource = () => number;
/** What the assistant is doing; drives the body language layered over the idle clip. */
export type AvatarMode = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AssistantAvatarProps {
  src?: string;
  /** Read every frame while the assistant speaks; null when silent. */
  level?: React.RefObject<LevelSource | null>;
  /** Plays the authored gesture once. Bump to trigger again. */
  gesture?: number;
  paused?: boolean;
  mode?: AvatarMode;
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
const BODY = { chest: 'Chest_M_02', spine: 'Spine1_M_01', neck: 'Neck_M_027', shoulderR: 'Shoulder_R_04', shoulderL: 'Shoulder_L_063', elbowR: 'Elbow_R_08', elbowL: 'Elbow_L_067' } as const;
type Pose = Partial<Record<keyof typeof BODY | 'head', [number, number, number]>>;

/**
 * Body language per mode, as small rotations (radians) added on top of the idle clip.
 * t is seconds, v the smoothed voice level 0..1 while speaking.
 *   listening  lean in, head tilted, slow attentive nods
 *   thinking   head turned and tilted, one hand up, slow sway
 *   speaking   nods and arm gestures that follow the loudness and rhythm of the voice
 */
export function poseFor(mode: AvatarMode, t: number, v: number): Pose {
  if (mode === 'listening') return { spine: [0.06, 0, 0], chest: [0.08, 0, 0], head: [0.06 + Math.sin(t * 2.2) * 0.035, 0, 0.1], neck: [0.04, 0, 0] };
  if (mode === 'thinking') return { head: [-0.05, 0.18 + Math.sin(t * 0.9) * 0.06, -0.12], chest: [0, Math.sin(t * 0.7) * 0.04, 0], shoulderR: [0, 0, 0.45], elbowR: [0, 0, 0.6] };
  if (mode === 'speaking') {
    const beat = Math.sin(t * 5.2), sway = Math.sin(t * 1.6);
    return {
      head: [0.03 + v * 0.1 * (0.6 + 0.4 * beat), sway * 0.08, Math.sin(t * 1.1) * 0.04],
      chest: [v * 0.04, sway * 0.05, 0],
      shoulderR: [0, 0, 0.12 + v * 0.35 * (0.5 + 0.5 * Math.sin(t * 3.1))],
      shoulderL: [0, 0, -(0.1 + v * 0.3 * (0.5 + 0.5 * Math.sin(t * 2.7 + 1.3)))],
      elbowR: [0, 0, v * 0.3 * (0.5 + 0.5 * Math.sin(t * 3.1 + 0.6))],
      elbowL: [0, 0, -v * 0.25 * (0.5 + 0.5 * Math.sin(t * 2.7 + 2))],
    };
  }
  // Idle: slow breathing and a gentle look around.
  return { chest: [Math.sin(t * 1.3) * 0.02, 0, 0], head: [Math.sin(t * 0.7) * 0.025, Math.sin(t * 0.45) * 0.08, 0] };
}

/*
 * The model's only clip ("Experiment") is a lively showcase — head swings, arm sweeps — not a calm
 * idle. Played at full weight it fights every pose, so it runs as a faint, slow base layer and
 * plays fully only for the one-off gesture (greeting).
 */
const CLIP_WEIGHT: Record<AvatarMode, number> = { idle: 0.25, listening: 0.1, thinking: 0.12, speaking: 0.12 };
/** A calm moment of that clip (both arms down, measured from the wrist bones): the resting pose. */
const REST_TIME = 1.85;
/** Neck and head keep facing the customer: the clip's head turns are kept only this much. */
const FACE_NAMES = ['Neck_M_027', 'NeckPart1_M_028', 'NeckPart2_M_029', 'NeckPart3_M_030', 'NeckPart4_M_031', 'NeckPart5_M_032', HEAD];
const FACE_KEEP = 0.15;

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

function Robot({ gltf, level, gesture, paused, mode = 'idle' }: { gltf: GLTF; level?: AssistantAvatarProps['level']; gesture?: number; paused?: boolean; mode?: AvatarMode }) {
  const { invalidate } = useThree();
  const mixer = useMemo(() => new AnimationMixer(gltf.scene), [gltf]);
  const clip = gltf.animations[0];
  const action = useMemo(() => (clip ? mixer.clipAction(clip) : null), [mixer, clip]);
  // The same clip frozen at REST_TIME carries the rest of the weight, so a faint clip blends
  // toward a relaxed pose instead of the bind pose (which has one arm raised).
  const rest = useMemo(() => {
    if (!clip) return null;
    const frozen = mixer.clipAction(clip.clone());
    frozen.time = REST_TIME;
    frozen.paused = true;
    return frozen;
  }, [mixer, clip]);
  // Rig joints are mutated every frame, so they live in a ref rather than memoised state.
  const joints = useRef<{ open: Object3D | null; closed: Object3D | null; smiles: Object3D[]; head: Object3D | null; body: Partial<Record<keyof Pose, Object3D>>; face: [Object3D, Quaternion][] } | null>(null);
  useEffect(() => {
    const find = (name: string) => gltf.scene.getObjectByName(name) ?? null;
    const body: Partial<Record<keyof Pose, Object3D>> = {};
    for (const [key, name] of Object.entries(BODY)) {
      const bone = find(name);
      if (bone) body[key as keyof Pose] = bone;
    }
    const head = find(HEAD);
    if (head) body.head = head;
    // Bind-pose rotations, read before the clip first plays: the face looks straight ahead there.
    const face = FACE_NAMES.map(find).filter(Boolean).map((bone) => [bone, bone!.quaternion.clone()] as [Object3D, Quaternion]);
    joints.current = { open: find(MOUTH_OPEN), closed: find(MOUTH_CLOSED), smiles: MOUTH_SMILES.map(find).filter(Boolean) as Object3D[], head, body, face };
  }, [gltf]);
  const mouth = useRef(0);
  // Offsets added last frame (undone first, so they never pile up when the clip is paused),
  // and the blended pose that eases from one mode to the next.
  const applied = useRef(new Map<Object3D, [number, number, number]>());
  const blended = useRef<Pose>({});
  const voice = useRef(0);
  // The host re-renders on speak/pause/gesture; demand mode needs a frame to pick that up.
  useEffect(() => {
    invalidate();
  });

  useEffect(() => {
    action?.play();
    rest?.play();
    return () => {
      mixer.stopAllAction();
    };
  }, [action, rest, mixer]);

  // Until when the authored clip plays at full weight (a gesture); otherwise it is a faint layer.
  const gestureUntil = useRef(0);
  useEffect(() => {
    if (!gesture || !action) return;
    action.reset().play();
    gestureUntil.current = performance.now() + (clip?.duration ?? 3) * 1000;
    invalidate();
  }, [gesture, action, clip, invalidate]);
  const clipWeight = useRef(CLIP_WEIGHT.idle);

  useFrame((_, delta) => {
    for (const [bone, [x, y, z]] of applied.current) bone.rotation.set(bone.rotation.x - x, bone.rotation.y - y, bone.rotation.z - z);
    applied.current.clear();
    const full = performance.now() < gestureUntil.current;
    clipWeight.current = MathUtils.damp(clipWeight.current, full ? 1 : CLIP_WEIGHT[mode], 4, delta);
    if (action) {
      action.setEffectiveWeight(clipWeight.current);
      action.setEffectiveTimeScale(full ? 1 : 0.55);
    }
    rest?.setEffectiveWeight(1 - clipWeight.current);
    if (!paused) mixer.update(Math.min(delta, 0.1));
    if (!full) for (const [bone, bind] of joints.current?.face ?? []) bone.quaternion.slerp(bind, 1 - FACE_KEEP);
    const source = level?.current;
    const target = source ? source() : 0;
    mouth.current = MathUtils.damp(mouth.current, target, 18, delta);
    const open = mouth.current;
    const rig = joints.current;
    if (rig && (source || open > 0.01)) {
      if (rig.open) rig.open.scale.setScalar(open > 0.06 ? 0.35 + open * 0.9 : 0.0001);
      if (rig.closed) rig.closed.scale.setScalar(open > 0.06 ? 0.0001 : 1);
      for (const s of rig.smiles) s.scale.setScalar(0.0001);
    }
    // Body language: the voice level is smoothed more than the mouth, and the pose itself eases
    // between modes (and back to idle when a sentence ends), so nothing snaps.
    voice.current = MathUtils.damp(voice.current, target, 6, delta);
    // During a gesture the clip leads and the pose steps back.
    const goal = paused || full ? {} : poseFor(mode, performance.now() / 1000, voice.current);
    let moving = false;
    if (rig)
      for (const key of Object.keys(rig.body) as (keyof Pose)[]) {
        const bone = rig.body[key]!, want = goal[key] ?? [0, 0, 0], have = blended.current[key] ?? [0, 0, 0];
        const next = have.map((v, i) => MathUtils.damp(v, want[i], 5, delta)) as [number, number, number];
        blended.current[key] = next;
        if (Math.abs(next[0]) + Math.abs(next[1]) + Math.abs(next[2]) < 1e-4) continue;
        moving = true;
        bone.rotation.set(bone.rotation.x + next[0], bone.rotation.y + next[1], bone.rotation.z + next[2]);
        applied.current.set(bone, next);
      }
    if (!paused || source || moving) invalidate();
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
 * Talking 3D assistant. The GLB plays its idle clip; while TTS audio plays, `level` drives
 * the mouth joints, and `mode` adds listening / thinking / speaking body language on top.
 */
export function AssistantAvatar({ src = avatarModelUrl(), level, gesture, paused, mode, onReady, onError }: AssistantAvatarProps) {
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

  const box = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(box);
  return (
    <div ref={box} style={{ width: '100%', height: '100%' }}>
    <Canvas resize={{ offsetSize: true }} flat dpr={canvasDpr()} frameloop={onScreen ? 'demand' : 'never'} camera={{ fov: 30, near: 0.01, far: 100 }} gl={{ alpha: true, antialias: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[1.5, 2.5, 3]} intensity={2.4} />
      <directionalLight position={[-2, 1, -1]} intensity={0.8} color="#00c9a7" />
      {gltf && (
        <>
          <Robot gltf={gltf} level={level} gesture={gesture} paused={paused} mode={mode} />
          <Frame object={gltf.scene} />
        </>
      )}
    </Canvas>
    </div>
  );
}

export default AssistantAvatar;
