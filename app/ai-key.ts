import { env } from 'cloudflare:workers';

/*
 * OpenAI key saved by the site administrator (Admin → AI status), used instead of the Supabase
 * secret OPENAI_API_KEY. It is stored in D1 encrypted with AES-GCM under a key derived from
 * RF_PROXY_SECRET, never returned to a browser (only its last 4 characters), and travels to the
 * Edge Function only in the X-RF-OpenAI-Key header next to the proxy secret, which the function
 * checks before reading it.
 */
const SETTING = 'openai_key';
const enc = new TextEncoder();
let cache: { at: number; value: string } | null = null;

const secret = () => ((env as unknown as Record<string, string>).RF_PROXY_SECRET || '').trim();
async function aesKey() {
  const base = await crypto.subtle.importKey('raw', enc.encode(secret()), 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: enc.encode('rf-openai-key'), info: enc.encode('v1') }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export const keyStorageAvailable = () => !!secret();

export async function saveOpenAiKey(value: string | null, by: string) {
  cache = null;
  if (!value) {
    await env.DB!.prepare('DELETE FROM app_settings WHERE key=?').bind(SETTING).run();
    return;
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(), enc.encode(value)));
  const stored = JSON.stringify({ iv: b64(iv), data: b64(sealed), last4: value.slice(-4) });
  await env.DB!.prepare('INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(SETTING, stored, new Date().toISOString(), by).run();
}

async function row() {
  return env.DB!.prepare('SELECT value,updated_at FROM app_settings WHERE key=?').bind(SETTING).first<{ value: string; updated_at: string }>();
}

/** The decrypted admin key, or '' (no key saved, no secret to decrypt it, or it cannot be read). */
export async function storedOpenAiKey() {
  if (cache && Date.now() - cache.at < 60000) return cache.value;
  let value = '';
  try {
    const r = secret() ? await row() : null;
    if (r) {
      const s = JSON.parse(r.value);
      value = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(s.iv) }, await aesKey(), unb64(s.data)));
    }
  } catch {
    value = '';
  }
  cache = { at: Date.now(), value };
  return value;
}

export async function storedKeyInfo() {
  try {
    const r = await row();
    if (!r) return { saved: false as const };
    return { saved: true as const, last4: String(JSON.parse(r.value).last4 || ''), updatedAt: r.updated_at };
  } catch {
    return { saved: false as const };
  }
}

/** Headers for a call to the Edge Function, with the admin key when one is saved. */
export async function aiHeaders(base: Record<string, string>) {
  const key = base['X-RF-Proxy'] ? await storedOpenAiKey() : '';
  return key ? { ...base, 'X-RF-OpenAI-Key': key } : base;
}
