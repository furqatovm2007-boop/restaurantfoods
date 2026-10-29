import { env } from 'cloudflare:workers';
import { ApiError } from './http';

/*
 * The hall as guests see it.
 *  - 3D hall (VIP, paid once): `has_3d_hall` is switched on by the site administrator after the team has
 *    measured the hall and built its model; until then every restaurant gets the 2D architectural plan.
 *    Kept in app_settings ('hall3d:<restaurant>') with the attached model / configuration (URL or notes).
 *  - Table details for the 2D plan: zone (main hall, terrace, VIP, window), kind (round, rectangular,
 *    VIP sofa) and amenity tags, per table number ('tablemeta:<restaurant>').
 *  - Ambience: entrance, stage, bar, plants and windows placed by the owner ('hallscene:<restaurant>').
 *    Nothing is drawn that the owner has not placed.
 *  - 3D hall requests from owners ('hall3d-leads'), for the administrator.
 * No schema change: these are small JSON values next to the other per-restaurant settings.
 */
export const ZONES = ['main', 'terrace', 'vip', 'window'] as const;
export const KINDS = ['round', 'rect', 'vip'] as const;
export const TAGS = ['window', 'sofa', 'charger', 'quiet'] as const;
export const SCENE_TYPES = ['entrance', 'stage', 'bar', 'plant', 'window'] as const;
export const PACKAGES = {
  small: { label: 'Kichik zal (15 tagacha stol)', price: 1900000 },
  standard: { label: 'Standart restoran (35 tagacha stol)', price: 3500000 },
  premium: { label: 'Premium / Ko‘p qavatli majmua', price: 5900000 },
} as const;
export type Zone = (typeof ZONES)[number];
export interface TableMeta {
  zone: Zone;
  kind: (typeof KINDS)[number] | '';
  tags: string[];
  /** 70/30 buffer: kept for walk-in guests only — shown on the plan, never bookable online. */
  walkin: boolean;
}
export interface SceneItem {
  id: string;
  type: (typeof SCENE_TYPES)[number];
  floor: number;
  x: number;
  y: number;
}
export interface Hall3d {
  enabled: boolean;
  config: string;
  updatedAt: string;
}

async function read<T>(key: string, fallback: T): Promise<T> {
  const row = await env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key).first<{ value: string }>();
  try {
    return row ? (JSON.parse(row.value) as T) : fallback;
  } catch {
    return fallback;
  }
}
async function write(key: string, value: unknown, by: string) {
  await env.DB!.prepare('INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at,updated_by=excluded.updated_by')
    .bind(key, JSON.stringify(value), new Date().toISOString(), by)
    .run();
}

export async function hall3dOf(restaurantId: string): Promise<Hall3d> {
  const v = await read<Partial<Hall3d>>('hall3d:' + restaurantId, {});
  return { enabled: v.enabled === true, config: typeof v.config === 'string' ? v.config : '', updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : '' };
}
/** Restaurants with the 3D hall switched on, in one query (catalog badges). */
export async function hall3dEnabled() {
  const rows = (await env.DB!.prepare("SELECT key,value FROM app_settings WHERE key LIKE 'hall3d:%'").all<{ key: string; value: string }>()).results;
  const out = new Set<string>();
  for (const r of rows) {
    try {
      if (JSON.parse(r.value).enabled === true) out.add(r.key.slice(7));
    } catch {}
  }
  return out;
}
/** The model / configuration: an https link (model file, viewer) or short notes for the team, ≤ 2000 chars. */
export function cleanConfig(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : '';
  if (s.length > 2000) throw new ApiError(400, '3D konfiguratsiya 2000 belgidan oshmasin.');
  if (/^[a-z]+:/i.test(s) && !/^https:\/\//i.test(s)) throw new ApiError(400, 'Havola faqat https:// bilan boshlansin.');
  return s;
}
export async function saveHall3d(restaurantId: string, enabled: boolean, config: unknown, by: string) {
  const value: Hall3d = { enabled, config: cleanConfig(config), updatedAt: new Date().toISOString() };
  await write('hall3d:' + restaurantId, value, by);
  return value;
}

export function cleanMeta(input: any): TableMeta {
  const zone = ZONES.includes(input?.zone) ? input.zone : 'main';
  const kind = KINDS.includes(input?.kind) ? input.kind : '';
  const tags = Array.isArray(input?.tags) ? [...new Set(input.tags.filter((t: unknown) => TAGS.includes(t as any)))] as string[] : [];
  return { zone, kind, tags, walkin: input?.walkin === true };
}
export async function tableMetaOf(restaurantId: string): Promise<Record<string, TableMeta>> {
  const raw = await read<Record<string, unknown>>('tablemeta:' + restaurantId, {});
  const out: Record<string, TableMeta> = {};
  for (const [k, v] of Object.entries(raw && typeof raw === 'object' ? raw : {})) if (/^\d{1,3}$/.test(k)) out[k] = cleanMeta(v);
  return out;
}
/** Table numbers kept for walk-in guests only (the owner's 70/30 buffer). */
export async function walkinTables(restaurantId: string) {
  return new Set(Object.entries(await tableMetaOf(restaurantId)).filter(([, m]) => m.walkin).map(([n]) => Number(n)));
}
/** Grace period: a booked table waits this many minutes after the start before it can go to a walk-in guest (app/grace.ts). */
export const GRACE_MIN = 10;
export const WALKIN_ONLY = 'Bu stol faqat jonli (walk-in) mehmonlar uchun saqlangan. Boshqa stol tanlang.';
export async function saveTableMeta(restaurantId: string, meta: Record<string, TableMeta>, by: string) {
  await write('tablemeta:' + restaurantId, meta, by);
}

export function cleanScene(items: unknown, floors: number): SceneItem[] {
  if (!Array.isArray(items)) return [];
  if (items.length > 40) throw new ApiError(400, 'Zal elementlari 40 tadan oshmasin.');
  return items.map((i: any, n) => {
    if (!SCENE_TYPES.includes(i?.type)) throw new ApiError(400, 'Zal elementi turi noto‘g‘ri.');
    const num = (v: unknown, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
    return { id: typeof i.id === 'string' && /^[\w-]{1,40}$/.test(i.id) ? i.id : 's' + n, type: i.type, floor: num(i.floor, 1, Math.max(1, floors)), x: num(i.x, 2, 98), y: num(i.y, 2, 98) };
  });
}
export async function sceneOf(restaurantId: string): Promise<SceneItem[]> {
  const v = await read<{ items?: unknown }>('hallscene:' + restaurantId, {});
  try {
    return cleanScene(v.items, 20);
  } catch {
    return [];
  }
}
export async function saveScene(restaurantId: string, items: SceneItem[], by: string) {
  await write('hallscene:' + restaurantId, { items }, by);
}

export interface Lead {
  id: string;
  restaurantId: string;
  restaurantName: string;
  ownerId: string;
  package: keyof typeof PACKAGES;
  price: number;
  phone: string;
  note: string;
  status: 'new' | 'done';
  createdAt: string;
}
export const leadsOf = async () => (await read<Lead[]>('hall3d-leads', [])).filter((l) => l && typeof l.id === 'string');
export async function addLead(input: { restaurantId: string; restaurantName: string; ownerId: string; package: unknown; phone: unknown; note: unknown }) {
  const pkg = typeof input.package === 'string' && input.package in PACKAGES ? (input.package as keyof typeof PACKAGES) : null;
  if (!pkg) throw new ApiError(400, 'Paketni tanlang.');
  const phone = typeof input.phone === 'string' ? input.phone.replace(/[\s()-]/g, '') : '';
  if (phone && !/^\+998\d{9}$/.test(phone)) throw new ApiError(400, 'Telefon: +998 va 9 ta raqam.');
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 500) : '';
  const leads = await leadsOf();
  if (leads.some((l) => l.restaurantId === input.restaurantId && l.status === 'new' && Date.now() - Date.parse(l.createdAt) < 86400000)) throw new ApiError(409, 'Arizangiz allaqachon qabul qilingan — mutaxassisimiz siz bilan bog‘lanadi.');
  const lead: Lead = { id: crypto.randomUUID(), restaurantId: input.restaurantId, restaurantName: input.restaurantName.slice(0, 120), ownerId: input.ownerId, package: pkg, price: PACKAGES[pkg].price, phone, note, status: 'new', createdAt: new Date().toISOString() };
  await write('hall3d-leads', [lead, ...leads].slice(0, 200), input.ownerId);
  return lead;
}
export async function markLead(id: string, status: 'new' | 'done', by: string) {
  const leads = await leadsOf();
  const lead = leads.find((l) => l.id === id);
  if (!lead) throw new ApiError(404, 'Ariza topilmadi.');
  lead.status = status;
  await write('hall3d-leads', leads, by);
  return lead;
}
