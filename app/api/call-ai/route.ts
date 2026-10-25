import { identity } from '../../access';
import { ApiError, json, failure, body, text, throttle } from '../../http';
import { callForWeb, openCallsFor, answerCall, understand, serviceVoice, lang, CALL_TEXT, type CallRow } from '../../call-ai';
import { serviceTts } from '../../ai-voice';
export const dynamic = 'force-dynamic';

/*
 * Live web call (/call-ai/:id). The page proves access with the call token from the Telegram
 * button (?k=) or the customer's own session. GET returns what the AI says; POST speech gives the
 * spoken question (OGG/Opus from the Edge Function, or null → the browser speaks it), transcribe
 * turns a recorded reply into text, answer records Yes / No (button, recognised speech or text).
 * GET ?open=1 lists the signed-in customer's open calls so the site can ring while they browse.
 */
const view = (b: CallRow) => {
  const l = lang(b.customer_lang),
    t = CALL_TEXT[l],
    name = (b.customer_name || '').split(/\s+/)[0] || 'mehmon';
  return { id: b.id, lang: l, name, restaurant: b.restaurant_name, restaurantPhone: b.restaurant_phone || '', table: b.table_number, guests: b.guests, date: b.date, slot: String(b.slot).slice(0, 5), status: b.status, callStatus: b.call_status, question: t.ask(name, b.restaurant_name, b.table_number), thanks: t.thanks, sorry: t.sorry, active: ['pending', 'confirmed'].includes(b.status) };
};
async function load(id: unknown, k: unknown) {
  const u = await identity().catch(() => null);
  const b = await callForWeb(text(id), typeof k === 'string' ? k : null, u?.userId ?? null);
  if (!b) throw new ApiError(404, 'Qo‘ng‘iroq topilmadi yoki havola eskirgan.');
  return b;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('open') === '1') {
      const u = await identity();
      if (!u) return json({ calls: [] });
      return json({ calls: (await openCallsFor(u.userId)).map((b) => ({ id: b.id, restaurant: b.restaurant_name, table: b.table_number, date: b.date, slot: String(b.slot).slice(0, 5) })) });
    }
    return json({ call: view(await load(url.searchParams.get('id'), url.searchParams.get('k'))) });
  } catch (e) {
    return failure(e);
  }
}

export async function POST(request: Request) {
  try {
    const b = await body(request);
    const call = await load(b.id, b.k);
    await throttle('call-ai-web:' + call.id, 40);
    const v = view(call);
    if (b.action === 'speech') {
      const which = b.say === 'thanks' ? v.thanks : b.say === 'sorry' ? v.sorry : v.question;
      // MP3 (nova voice) for browsers without OGG/Opus, e.g. Safari on iPhone; OGG otherwise.
      if (b.format === 'mp3') {
        const mp3 = await serviceTts(which, v.lang, 'nova');
        return json({ text: which, audio: mp3?.audio || null, mimeType: 'audio/mpeg' });
      }
      const voice = await serviceVoice({ mode: 'call_speech', lang: v.lang, text: which });
      return json({ text: which, audio: voice?.audio && voice.mimeType === 'audio/ogg' ? voice.audio : null, mimeType: 'audio/ogg' });
    }
    if (b.action === 'transcribe') {
      const a = b.audio;
      if (!a || !['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'].includes(a.mimeType) || typeof a.data !== 'string' || a.data.length > 600000) throw new ApiError(400, 'Ovoz yozuvi noto‘g‘ri.');
      const r = await serviceVoice({ mode: 'call_transcribe', lang: v.lang, audio: { mimeType: a.mimeType, data: a.data } });
      const transcript = r?.transcript || '';
      return json({ transcript, verdict: await understand(transcript, v.lang) });
    }
    if (b.action === 'answer') {
      if (!v.active) throw new ApiError(409, 'Bron faol emas.');
      const verdict = b.verdict === 'yes' || b.verdict === 'no' ? b.verdict : await understand(text(b.text, 1, 500), v.lang);
      if (!verdict) return json({ understood: false });
      const r = await answerCall(call, verdict);
      return json({ understood: true, verdict, message: r.message, restaurantPhone: v.restaurantPhone });
    }
    throw new ApiError(400, 'Noma’lum amal.');
  } catch (e) {
    return failure(e);
  }
}
