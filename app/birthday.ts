import { env } from 'cloudflare:workers';
import { planState } from './plans';
import { telegram, telegramConfigured, html } from './telegram';

/*
 * Birthday CRM (Business/Premium, feature birthdayCrm). Three days before a customer's birthday,
 * every restaurant they have visited that turned the promo on (birthday_percent > 0) sends them,
 * through the Telegram bot, a congratulation with a personal promo code and a "Book a table"
 * button. A code is created once per restaurant, customer and year (unique index), is valid
 * until a week after the birthday and works only for that customer at that restaurant.
 */
export const DAYS_BEFORE = 3;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const promoCode = () => 'BD-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => ALPHABET[b % 32]).join('');
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');

/** Runs from the cron trigger; does real work once a day at 10:00 Tashkent time (the first run in that hour). */
export async function runBirthdays(nowMs = Date.now(), force = false) {
  const local = new Date(nowMs + 5 * 3600000);
  if (!force && local.getUTCHours() !== 10) return { sent: 0 };
  if (!telegramConfigured()) return { sent: 0 };
  const target = new Date(local.getTime() + DAYS_BEFORE * 86400000);
  const md = target.toISOString().slice(5, 10),
    year = target.getUTCFullYear();
  const people = (await env.DB!.prepare("SELECT id,name,telegram_chat_id,preferred_language FROM accounts WHERE telegram_chat_id IS NOT NULL AND birth_date IS NOT NULL AND substr(birth_date,6,5)=? AND status='active'").bind(md).all<any>()).results;
  let sent = 0;
  for (const p of people) {
    // Restaurants the customer has really been to (or booked), with the promo turned on.
    const places = (await env.DB!.prepare("SELECT DISTINCT r.* FROM restaurants r JOIN bookings b ON b.restaurant_id=r.id WHERE b.user_id=? AND b.status IN ('confirmed','completed') AND r.status='active' AND r.birthday_percent>0").bind(p.id).all<any>()).results;
    for (const r of places) {
      if (!planState(r).features.birthdayCrm) continue;
      const code = promoCode();
      const expires = new Date(Date.UTC(year, target.getUTCMonth(), target.getUTCDate() + 7)).toISOString();
      const res = await env.DB!.prepare('INSERT INTO promo_codes (code,restaurant_id,user_id,percent,kind,year,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(code, r.id, p.id, r.birthday_percent, 'birthday', year, expires, new Date(nowMs).toISOString()).run();
      if (!res.meta.changes) continue;
      const name = String(p.name || '').split(/\s+/)[0] || 'Aziz mehmon';
      await telegram('sendMessage', {
        chat_id: p.telegram_chat_id,
        parse_mode: 'HTML',
        text: `🎉 <b>${html(name)}, tug‘ilgan kuningiz yaqinlashmoqda!</b>\n\n<b>${html(r.name)}</b> sizni oldindan tabriklaydi va bayramingiz uchun <b>${r.birthday_percent}% chegirma</b> sovg‘a qiladi.\n\n🎁 Promokod: <code>${code}</code>\n📅 ${expires.slice(0, 10)} gacha amal qiladi — bron qilishda kiriting.`,
        reply_markup: { inline_keyboard: [[{ text: '📅 Stol bron qilish', url: site() + '/#/restaurant/' + encodeURIComponent(r.id) }]] },
      });
      sent++;
    }
  }
  return { sent };
}
