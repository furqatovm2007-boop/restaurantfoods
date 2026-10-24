import { env } from 'cloudflare:workers';
import { sameSecret } from '../../../http';
import { SELECT_CALL, answerCall, understand, callHmac, lang, type CallRow } from '../../../call-ai';
export const dynamic = 'force-dynamic';

/*
 * Results of real phone calls. Vapi posts its server messages here (configure the Server URL
 * https://restaurantfoods.online/api/call-ai/hook and the secret VAPI_WEBHOOK_SECRET in Vapi; it is
 * sent as x-vapi-secret). Any other provider behind CALL_AI_WEBHOOK_URL posts
 * {bookingId, answer: "yes"|"no"|"no_answer", transcript?} signed with X-RF-Signature =
 * HMAC-SHA256(CALL_AI_WEBHOOK_SECRET, raw body). Only the end of the call changes the booking.
 */
const ok = () => Response.json({ ok: true });
const deny = () => new Response('Forbidden', { status: 403 });

async function settle(bookingId: unknown, verdict: 'yes' | 'no' | null, words = '') {
  if (typeof bookingId !== 'string' || !bookingId) return;
  const b = await env.DB!.prepare(SELECT_CALL + "WHERE b.id=? AND b.status IN ('pending','confirmed')").bind(bookingId).first<CallRow>();
  if (!b || !['calling', 'no_answer'].includes(b.call_status)) return;
  verdict ??= words ? await understand(words, lang(b.customer_lang)) : null;
  if (verdict) await answerCall(b, verdict);
  // No clear answer: the cron reports "no answer" to the restaurant when the call window passes.
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 200000) return new Response('Too large', { status: 413 });
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  const vapiSecret = env.VAPI_WEBHOOK_SECRET?.trim();
  const vapiHeader = request.headers.get('x-vapi-secret');
  if (vapiHeader !== null) {
    if (!vapiSecret || !(await sameSecret(vapiHeader, vapiSecret))) return deny();
    const m = data?.message;
    if (m?.type !== 'end-of-call-report') return ok();
    const bookingId = m.call?.metadata?.bookingId ?? m.call?.assistantOverrides?.variableValues?.bookingId;
    const structured = m.analysis?.structuredData?.confirmed;
    // Only the customer's own words count, never the assistant's question.
    const userText = Array.isArray(m.artifact?.messages) ? m.artifact.messages.filter((x: any) => x?.role === 'user').map((x: any) => String(x.message || '')).join(' ') : String(m.transcript || '').split('\n').filter((l: string) => /^user:/i.test(l)).join(' ');
    await settle(bookingId, structured === true ? 'yes' : structured === false ? 'no' : null, userText);
    return ok();
  }
  const secret = env.CALL_AI_WEBHOOK_SECRET?.trim();
  const sig = request.headers.get('x-rf-signature') || '';
  if (!secret || !(await sameSecret(sig, await callHmac(secret, raw)))) return deny();
  await settle(data?.bookingId, data?.answer === 'yes' ? 'yes' : data?.answer === 'no' ? 'no' : null, typeof data?.transcript === 'string' ? data.transcript.slice(0, 2000) : '');
  return ok();
}
