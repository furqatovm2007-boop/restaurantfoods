import { env } from 'cloudflare:workers';
import { identity } from '../../../access';
import { ApiError, json, failure, text } from '../../../http';
import { ensurePassCode, PASS_PREFIX, receiptNumber, receiptTotals } from '../../../booking-pass';
export const dynamic = 'force-dynamic';

/** Receipt + QR pass of one booking, for the customer who made it or the restaurant's staff. */
export async function GET(request: Request) {
  try {
    const u = await identity();
    if (!u) throw new ApiError(401, 'Avval akkauntingizga kiring.');
    const id = text(new URL(request.url).searchParams.get('id'));
    const b = await env.DB!.prepare('SELECT b.*,r.name AS restaurant_name,r.address AS restaurant_address,r.phone AS restaurant_phone,r.owner_id,r.service_fee_percent FROM bookings b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.id=?').bind(id).first<any>();
    if (!b || (b.user_id !== u.userId && b.owner_id !== u.userId && u.role !== 'admin')) throw new ApiError(404, 'Bron topilmadi.');
    let items: any[] = [];
    try {
      items = JSON.parse(b.preorder_items || '[]');
    } catch {
      items = [];
    }
    const dep = await env.DB!.prepare('SELECT amount,state FROM deposits WHERE booking_id=? ORDER BY created_at DESC LIMIT 1').bind(b.id).first<{ amount: number; state: string }>();
    const totals = receiptTotals(Array.isArray(items) ? items : [], b.service_fee_percent, { percent: b.discount_percent, amount: b.discount_amount, minOrder: b.discount_min_order, gift: b.gift_text }, dep?.state === 'paid' ? dep.amount : 0);
    // Bouquets ordered to this table (paid from the card, delivered by the florist).
    const flowers = (await env.DB!.prepare("SELECT title,quantity,total,status FROM flower_orders WHERE booking_id=? AND status IN ('paid','accepted','delivering','delivered') ORDER BY created_at").bind(b.id).all<{ title: string; quantity: number; total: number; status: string }>()).results;
    const active = ['pending', 'confirmed'].includes(b.status);
    const code = active ? await ensurePassCode(b.id, b.pass_code) : b.pass_code;
    return json({
      receiptNo: receiptNumber(b),
      issuedAt: b.created_at,
      restaurant: { name: b.restaurant_name, address: b.restaurant_address, phone: b.restaurant_phone },
      booking: { id: b.id, date: b.date, slot: b.slot, endSlot: b.end_slot, table: b.table_number, mergedTable: b.merged_table, guests: b.guests, status: b.status, checkedInAt: b.checked_in_at },
      items: totals.lines,
      subtotal: totals.subtotal,
      serviceFeePercent: totals.serviceFeePercent,
      serviceFee: totals.serviceFee,
      total: totals.total,
      discount: totals.discount || totals.discountAmount ? { percent: totals.discountPercent, amount: totals.discount, bonus: totals.discountAmount, minOrder: totals.minOrder, applied: totals.discount > 0, reason: b.discount_reason, code: b.promo_code } : null,
      gift: totals.gift ? { text: totals.gift, code: b.promo_code } : null,
      due: totals.due,
      deposit: b.deposit_status && b.deposit_status !== 'not_required' ? { status: b.deposit_status, amount: dep?.amount ?? null } : null,
      flowers,
      flowersTotal: flowers.reduce((sum, f) => sum + (Number(f.total) || 0), 0),
      pass: active && code ? { code, payload: PASS_PREFIX + code } : null,
    });
  } catch (e) {
    return failure(e);
  }
}
