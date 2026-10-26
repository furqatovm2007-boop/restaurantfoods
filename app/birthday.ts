import { env } from 'cloudflare:workers';
import { planState } from './plans';
import { telegram, telegramConfigured, html } from './telegram';

/*
 * Birthday CRM (Business/Premium, feature birthdayCrm). Three days before a customer's birthday,
 * every restaurant they have visited that keeps the promo on (birthday_enabled) sends them, through
 * the Telegram bot, a congratulation with a personal promo code and a "Book a table" button; on the
 * birthday itself the same code is sent once more as a greeting. A code is created once per
 * restaurant, customer and year (unique index), works for bookings within ±3 days of the birthday and
 * only for that customer at that restaurant.
 *
 * The owner picks the gift: a percent off the bill (standard 15%), a fixed amount off (with an
 * optional minimum order) or a special gift (e.g. a free cake). The code keeps a copy of the offer
 * as it was when sent, so later setting changes do not alter promises already made.
 */
export const DAYS_BEFORE = 3;
export const DEFAULT_PERCENT = 15;
export type BirthdayKind = 'percent' | 'amount' | 'gift';
export type BirthdayOffer = { type: BirthdayKind; percent: number; amount: number; minOrder: number; gift: string };
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const promoCode = () => 'BD-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => ALPHABET[b % 32]).join('');
const site = () => (env.SITE_URL?.trim() || 'https://restaurantfoods.online').replace(/\/$/, '');

/** The restaurant's current birthday offer. */
export function birthdayOffer(r: { birthday_kind?: string; birthday_percent?: number; birthday_amount?: number; birthday_min_order?: number; birthday_gift?: string }): BirthdayOffer {
  const gift = String(r.birthday_gift || '').trim();
  const type: BirthdayKind = r.birthday_kind === 'amount' ? 'amount' : r.birthday_kind === 'gift' && gift ? 'gift' : 'percent';
  return { type, percent: Number(r.birthday_percent) || DEFAULT_PERCENT, amount: Number(r.birthday_amount) || 0, minOrder: Number(r.birthday_min_order) || 0, gift };
}
const sum = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' so‘m';
/** The offer in words, for the Telegram greeting. */
export function offerText(o: BirthdayOffer) {
  if (o.type === 'amount') return `<b>${sum(o.amount)} bonus</b> (hisobdan ayiriladi${o.minOrder ? `, ${sum(o.minOrder)} dan ortiq buyurtmada` : ''})`;
  if (o.type === 'gift') return `maxsus sovg‘a: <b>${html(o.gift)}</b>`;
  return `<b>${o.percent}% chegirma</b>`;
}

/** Runs from the cron trigger; does real work once a day at 10:00 Tashkent time (the first run in that hour). */
export async function runBirthdays(nowMs = Date.now(), force = false) {
  const local = new Date(nowMs + 5 * 3600000);
  if (!force && local.getUTCHours() !== 10) return { sent: 0 };
  if (!telegramConfigured()) return { sent: 0 };
  let sent = 0;
  for (const ahead of [DAYS_BEFORE, 0]) {
    const target = new Date(local.getTime() + ahead * 86400000);
    const md = target.toISOString().slice(5, 10),
      year = target.getUTCFullYear();
    const people = (await env.DB!.prepare("SELECT id,name,telegram_chat_id,preferred_language FROM accounts WHERE telegram_chat_id IS NOT NULL AND birth_date IS NOT NULL AND substr(birth_date,6,5)=? AND status='active'").bind(md).all<any>()).results;
    for (const p of people) {
      // Restaurants the customer has really been to (or booked), with the promo turned on.
      const places = (await env.DB!.prepare("SELECT DISTINCT r.* FROM restaurants r JOIN bookings b ON b.restaurant_id=r.id WHERE b.user_id=? AND b.status IN ('confirmed','completed') AND r.status='active' AND r.birthday_enabled=1").bind(p.id).all<any>()).results;
      for (const r of places) {
        if (!planState(r).features.birthdayCrm) continue;
        const o = birthdayOffer(r);
        // Valid through the third day after the birthday (bookings must also fall within ±3 days, see validPromo).
        const expires = new Date(Date.UTC(year, target.getUTCMonth(), target.getUTCDate() + 4)).toISOString();
        const fresh = await env.DB!.prepare('INSERT INTO promo_codes (code,restaurant_id,user_id,percent,discount_type,amount,min_order,gift,reminded,kind,year,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(promoCode(), r.id, p.id, o.type === 'percent' ? o.percent : 0, o.type, o.type === 'amount' ? o.amount : 0, o.type === 'amount' ? o.minOrder : 0, o.type === 'gift' ? o.gift : '', ahead === 0 ? 1 : 0, 'birthday', year, expires, new Date(nowMs).toISOString()).run();
        let promo: any;
        if (fresh.meta.changes) promo = await env.DB!.prepare("SELECT * FROM promo_codes WHERE restaurant_id=? AND user_id=? AND kind='birthday' AND year=?").bind(r.id, p.id, year).first<any>();
        else if (ahead === 0) {
          // The birthday itself: remind once with the code sent three days ago, if still unused.
          const upd = await env.DB!.prepare("UPDATE promo_codes SET reminded=1 WHERE restaurant_id=? AND user_id=? AND kind='birthday' AND year=? AND reminded=0 AND used_booking_id IS NULL").bind(r.id, p.id, year).run();
          if (upd.meta.changes) promo = await env.DB!.prepare("SELECT * FROM promo_codes WHERE restaurant_id=? AND user_id=? AND kind='birthday' AND year=?").bind(r.id, p.id, year).first<any>();
        }
        if (!promo) continue;
        const offer = birthdayOffer({ birthday_kind: promo.discount_type, birthday_percent: promo.percent, birthday_amount: promo.amount, birthday_min_order: promo.min_order, birthday_gift: promo.gift });
        const name = String(p.name || '').split(/\s+/)[0] || 'Aziz mehmon';
        const head = ahead ? `🎉 <b>${html(name)}, tug‘ilgan kuningiz yaqinlashmoqda!</b>\n\n<b>${html(r.name)}</b> sizni oldindan tabriklaydi va bayramingiz uchun ${offerText(offer)} sovg‘a qiladi.` : `🎂 <b>${html(name)}, tug‘ilgan kuningiz muborak!</b>\n\n<b>${html(r.name)}</b> jamoasi sizni chin qalbdan tabriklaydi. Bayram sovg‘angiz — ${offerText(offer)} — sizni kutmoqda.`;
        await telegram('sendMessage', {
          chat_id: p.telegram_chat_id,
          parse_mode: 'HTML',
          text: `${head}\n\n🎁 Promokod: <code>${promo.code}</code>\n📅 ${String(promo.expires_at).slice(0, 10)} gacha amal qiladi — bron qilishda kiriting.`,
          reply_markup: { inline_keyboard: [[{ text: '📅 Stol bron qilish', url: site() + '/#/restaurant/' + encodeURIComponent(r.id) }]] },
        });
        sent++;
      }
    }
  }
  return { sent };
}
