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
    const totals = receiptTotals(Array.isArray(items) ? items : [], b.service_fee_percent);
    const active = ['pending', 'confirmed'].includes(b.status);
    const code = active ? await ensurePassCode(b.id, b.pass_code) : b.pass_code;
    return json({
      receiptNo: receiptNumber(b),
      issuedAt: b.created_at,
      restaurant: { name: b.restaurant_name, address: b.restaurant_address, phone: b.restaurant_phone },
      booking: { id: b.id, date: b.date, slot: b.slot, endSlot: b.end_slot, table: b.table_number, guests: b.guests, status: b.status, checkedInAt: b.checked_in_at },
      items: totals.lines,
      subtotal: totals.subtotal,
      serviceFeePercent: totals.serviceFeePercent,
      serviceFee: totals.serviceFee,
      total: totals.total,
      deposit: b.deposit_status && b.deposit_status !== 'not_required' ? { status: b.deposit_status } : null,
      pass: active && code ? { code, payload: PASS_PREFIX + code } : null,
    });
  } catch (e) {
    return failure(e);
  }
}
