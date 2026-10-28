import { env } from 'cloudflare:workers';
import { html, telegram, telegramConfigured } from './telegram';

/*
 * Health watch (cron, every 5 minutes): the Telegram webhook must point at this site and deliver
 * without errors, and the API must not throw a burst of 5xx responses. A problem sends one Telegram
 * message to the administrator (accounts with role 'admin' and a linked chat, or ADMIN_TELEGRAM_CHAT_ID),
 * at most once an hour per kind, and a "recovered" message when it clears. The last result is kept in
 * app_settings ('health:last') for the admin panel.
 */
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');
const BUCKET_MS = 10 * 60000;
export const ERROR_LIMIT = 20; // 5xx responses within the last 20 minutes
const REPEAT_MS = 60 * 60000;

export interface Problem {
  kind: 'telegram' | 'errors';
  text: string;
}

const setting = (key: string) => env.DB!.prepare('SELECT value FROM app_settings WHERE key=?').bind(key).first<{ value: string }>();
const save = (key: string, value: string) =>
  env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,?,?,'health') ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(key, value, new Date().toISOString()).run();

/** Counts a 5xx API response in a 10-minute bucket (called from the Worker, after the response). */
export async function recordServerError(now = Date.now()) {
  const bucket = Math.floor(now / BUCKET_MS);
  await env.DB!.prepare("INSERT INTO app_settings (key,value,updated_at,updated_by) VALUES (?,'1',?,'health') ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(value AS INTEGER)+1 AS TEXT),updated_at=excluded.updated_at")
    .bind('health:5xx:' + bucket, new Date(now).toISOString())
    .run();
}

async function recentErrors(now: number) {
  const bucket = Math.floor(now / BUCKET_MS);
  const rows = (await env.DB!.prepare('SELECT value FROM app_settings WHERE key IN (?,?)').bind('health:5xx:' + bucket, 'health:5xx:' + (bucket - 1)).all<{ value: string }>()).results;
  // Old buckets are dropped as we go.
  await env.DB!.prepare("DELETE FROM app_settings WHERE key LIKE 'health:5xx:%' AND key NOT IN (?,?)").bind('health:5xx:' + bucket, 'health:5xx:' + (bucket - 1)).run();
  return rows.reduce((s, r) => s + (Number(r.value) || 0), 0);
}

/** What is wrong right now (empty when healthy). */
export async function checkHealth(now = Date.now()): Promise<Problem[]> {
  const problems: Problem[] = [];
  if (telegramConfigured()) {
    const info = (await telegram('getWebhookInfo', {})) as { url?: string; pending_update_count?: number; last_error_date?: number; last_error_message?: string } | null;
    const expected = site() + '/api/telegram/webhook';
    if (!info) problems.push({ kind: 'telegram', text: 'Telegram API javob bermadi — TELEGRAM_BOT_TOKEN noto‘g‘ri yoki Telegram ishlamayapti.' });
    else if (String(info.url || '').replace(/\?.*$/, '') !== expected) problems.push({ kind: 'telegram', text: `Bot webhooki saytga ulanmagan (hozir: ${info.url || 'bo‘sh'}). Admin panel → Telegram bot → “Webhookni yangilash”.` });
    else if (info.last_error_date && now / 1000 - info.last_error_date < 15 * 60) problems.push({ kind: 'telegram', text: `Bot xabarlari saytga yetmayapti: ${String(info.last_error_message || 'xato').slice(0, 160)}` });
    else if ((info.pending_update_count || 0) > 20) problems.push({ kind: 'telegram', text: `Botda ${info.pending_update_count} ta xabar navbatda qolib ketgan.` });
  }
  const errors = await recentErrors(now);
  if (errors >= ERROR_LIMIT) problems.push({ kind: 'errors', text: `So‘nggi 20 daqiqada API ${errors} marta server xatosi (5xx) qaytardi. Cloudflare → Workers → Logs ni tekshiring.` });
  return problems;
}

export async function adminChats() {
  const rows = (await env.DB!.prepare("SELECT telegram_chat_id FROM accounts WHERE role='admin' AND telegram_chat_id IS NOT NULL AND telegram_chat_id<>''").all<{ telegram_chat_id: string }>()).results.map((r) => r.telegram_chat_id);
  const extra = env.ADMIN_TELEGRAM_CHAT_ID?.trim();
  return [...new Set([...rows, ...(extra ? [extra] : [])])];
}

/** Cron entry: check, alert on new or repeating problems (hourly), report recovery, remember the result. */
export async function runHealthCheck(now = Date.now()) {
  const problems = await checkHealth(now);
  const prev = JSON.parse((await setting('health:alerts'))?.value || '{}') as Record<string, number>;
  const chats = await adminChats();
  const next: Record<string, number> = {};
  const send = async (text: string) => {
    for (const chat_id of chats) await telegram('sendMessage', { chat_id, text, parse_mode: 'HTML' });
  };
  for (const p of problems) {
    next[p.kind] = prev[p.kind] && now - prev[p.kind] < REPEAT_MS ? prev[p.kind] : now;
    if (next[p.kind] === now) await send(`⚠️ <b>RestaurantFoods: muammo</b>\n${html(p.text)}`);
  }
  for (const kind of Object.keys(prev)) if (!next[kind]) await send(`✅ <b>RestaurantFoods:</b> ${kind === 'telegram' ? 'Telegram bot' : 'API xatolari'} yana normal.`);
  await save('health:alerts', JSON.stringify(next));
  await save('health:last', JSON.stringify({ at: new Date(now).toISOString(), problems, alertChats: chats.length }));
  if (problems.length && !chats.length) console.error(JSON.stringify({ event: 'health_alert_no_admin_chat', kinds: problems.map((p) => p.kind) }));
  return { problems, alerted: chats.length };
}
