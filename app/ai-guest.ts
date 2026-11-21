import { env } from 'cloudflare:workers';
import { identity } from './access';
import { throttle, clientIp } from './http';
import { storedOpenAiKey } from './ai-key';
import { SIMPLE_MVP_MODE } from './mvp';
import { issueSession } from './telegram-login';

/*
 * The customer AI assistant for everyone (SIMPLE_MVP_MODE):
 *  - aiUser(): the signed-in user, or — for a visitor with no account — a guest record and a site session
 *    (the same kind the quick booking makes), so the daily question limit still counts per browser;
 *  - openAiDirect(): OpenAI straight from the Worker with the admin's saved key (Admin → AI) or
 *    OPENAI_API_KEY, for visitors without a Supabase session (the Edge Function needs one). It answers only
 *    from the live catalog; when it cannot (no key, limit, timeout) the routes fall back to Cloudflare Workers AI.
 */
export async function aiUser(request: Request) {
  const u = await identity().catch(() => null);
  if (u || !SIMPLE_MVP_MODE) return u;
  await throttle('ai-guest:ip:' + clientIp(request), 20, 3600000);
  const userId = 'guest:' + crypto.randomUUID();
  await env.DB!.prepare("INSERT INTO accounts (id,email,name,created_at,role,role_selected,provider) VALUES (?,'','Mehmon',?,'customer',1,'guest')").bind(userId, new Date().toISOString()).run();
  await issueSession(userId);
  return { userId, role: 'customer' };
}

const SYSTEM: Record<string, string> = {
  uz: 'Siz RestaurantFoods (Samarqand) saytining do‘stona AI yordamchisisiz. Faqat o‘zbek tilida, qisqa (2–5 jumla) javob bering.',
  ru: 'Вы дружелюбный AI-помощник сайта RestaurantFoods (Самарканд). Отвечайте только по-русски, коротко (2–5 предложений).',
  en: 'You are the friendly AI assistant of RestaurantFoods (Samarkand). Answer in English only, briefly (2–5 sentences).',
};
const RULES =
  ' Recommend restaurants and dishes ONLY from the JSON catalog below, with their exact names and prices in UZS; never invent restaurants, dishes, prices or free tables. Restaurants marked is_demo are DEMO samples — say so. To book: open the restaurant, pick a free table on the hall plan, time and guests. Delivery: only restaurants with delivery=true; add dishes to the cart (Korzinka) and choose "Yetkazib berish". You never place orders or bookings yourself — the guest confirms them on the site.';

export async function openAiDirect(lang: string, message: string, history: { role: string; content: string }[], catalog: unknown) {
  const key = (await storedOpenAiKey()) || env.OPENAI_API_KEY?.trim() || '';
  if (!key) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini',
        temperature: 0.4,
        max_tokens: 450,
        messages: [{ role: 'system', content: (SYSTEM[lang] || SYSTEM.uz) + RULES + '\nCATALOG: ' + JSON.stringify(catalog).slice(0, 40000) }, ...history.slice(-8), { role: 'user', content: message }],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const reply = String(((await res.json()) as any)?.choices?.[0]?.message?.content || '').trim();
    return reply ? { reply, engine: 'openai', recommendations: [] as any[] } : null;
  } catch {
    return null;
  }
}
