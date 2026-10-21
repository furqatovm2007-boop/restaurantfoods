/*
 * Voice for the admin orb, using the same authenticated /api/ai-voice endpoint as the
 * customer robot: OpenAI TTS for replies (with browser speech as a fallback) and
 * push-to-talk recording sent for transcription. The audio level drives the orb.
 */
type Lang = 'uz' | 'ru' | 'en';

let context: AudioContext | null = null;
function audioContext() {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context ??= new Ctor({ latencyHint: 'playback' });
  return context;
}

/** Call from a click handler so later playback is allowed by autoplay rules. */
export function unlockAudio() {
  audioContext()?.resume().catch(() => {});
}

async function voiceRequest<T>(payload: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch('/api/ai-voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'AI_VOICE_UNAVAILABLE');
  return data;
}

export interface Playback {
  /** Current loudness 0..1 while speaking. */
  level: () => number;
  done: Promise<void>;
  stop: () => void;
}

function browserSpeech(text: string, lang: Lang): Playback {
  const synth = window.speechSynthesis;
  let speaking = true;
  const done = new Promise<void>((resolve) => {
    if (!synth) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }[lang];
    u.onend = u.onerror = () => {
      speaking = false;
      resolve();
    };
    synth.speak(u);
  });
  // speechSynthesis exposes no audio stream; a syllable-like wobble keeps the orb alive.
  return { level: () => (speaking ? 0.35 + 0.3 * Math.abs(Math.sin(performance.now() / 110)) : 0), done, stop: () => synth?.cancel() };
}

export async function speak(text: string, lang: Lang, signal?: AbortSignal): Promise<Playback> {
  const ctx = audioContext();
  try {
    if (!ctx) throw new Error('NO_AUDIO');
    const data = await voiceRequest<{ audio: string }>({ mode: 'speech', lang, text: text.slice(0, 1600) }, signal);
    const bytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
    const buffer = await ctx.decodeAudioData(bytes.buffer);
    await ctx.resume();
    const source = ctx.createBufferSource();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const samples = new Uint8Array(analyser.fftSize);
    let playing = true;
    const done = new Promise<void>((resolve) => {
      source.onended = () => {
        playing = false;
        analyser.disconnect();
        resolve();
      };
    });
    source.start();
    return {
      level: () => {
        if (!playing) return 0;
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const s of samples) sum += ((s - 128) / 128) ** 2;
        return Math.min(1, Math.sqrt(sum / samples.length) * 5);
      },
      done,
      stop: () => {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
      },
    };
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    return browserSpeech(text, lang);
  }
}

export interface Recording {
  /** Stops recording and resolves with the transcript. */
  finish: () => Promise<string>;
  cancel: () => void;
  level: () => number;
}

const RECORD_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
const MAX_RECORD_MS = 15000;

export async function record(lang: Lang): Promise<Recording> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('VOICE_UNSUPPORTED');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const mimeType = RECORD_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
  const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  const ctx = audioContext();
  const analyser = ctx?.createAnalyser();
  const input = ctx?.createMediaStreamSource(stream);
  if (analyser && input) input.connect(analyser);
  const samples = new Uint8Array(analyser?.fftSize ?? 0);
  const release = () => {
    stream.getTracks().forEach((track) => track.stop());
    input?.disconnect();
  };
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));
  recorder.start();
  const limit = window.setTimeout(() => recorder.state === 'recording' && recorder.stop(), MAX_RECORD_MS);

  return {
    level: () => {
      if (!analyser) return 0;
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += ((s - 128) / 128) ** 2;
      return Math.min(1, Math.sqrt(sum / samples.length) * 6);
    },
    cancel: () => {
      clearTimeout(limit);
      if (recorder.state === 'recording') recorder.stop();
      release();
    },
    finish: async () => {
      clearTimeout(limit);
      if (recorder.state === 'recording') recorder.stop();
      await stopped;
      release();
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      if (blob.size < 800) return '';
      const base = (recorder.mimeType || 'audio/webm').split(';')[0];
      const type = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'].includes(base) ? base : 'audio/webm';
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      const { transcript } = await voiceRequest<{ transcript: string }>({ mode: 'transcribe', lang, audio: { mimeType: type, data: btoa(binary) } });
      return transcript?.trim() ?? '';
    },
  };
}
