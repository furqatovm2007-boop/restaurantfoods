/* Status rules for the live table map, kept free of React so they are unit-tested. */
export type MapStatus = 'free' | 'occupied' | 'booked';

export interface MapTable {
  number: number;
  floor: number;
  seats: number;
  x: number;
  y: number;
  shape: string;
  active: number;
}
export interface MapLive {
  table_number: number;
  status: string;
  source: string;
  confidence: number | null;
  updated_at: string;
}
export interface MapBooking {
  table_number: number;
  slot: string;
  end_slot: string;
}

export const STATUS_COLOR: Record<MapStatus, string> = { free: '#22c55e', occupied: '#ef4444', booked: '#facc15' };

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
};

/** Restaurant-local (Tashkent, UTC+5) date and minute of day. */
export function tashkentNow(now = Date.now()) {
  const t = new Date(now + 5 * 3600000);
  return { date: t.toISOString().slice(0, 10), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
}

/**
 * What a table is right now. A manual mark wins; otherwise the camera's "occupied", then a
 * booking covering this minute (or a reserved mark), else free.
 */
export function tableStatus(number: number, live: MapLive[], bookings: MapBooking[], minutes: number): { status: MapStatus; source: 'manual' | 'camera' | 'booking' | null } {
  const mark = live.find((l) => l.table_number === number && l.status !== 'unknown');
  const named = (s: string): MapStatus => (s === 'occupied' ? 'occupied' : s === 'reserved' ? 'booked' : 'free');
  if (mark?.source === 'manual') return { status: named(mark.status), source: 'manual' };
  if (mark?.status === 'occupied') return { status: 'occupied', source: 'camera' };
  if (bookings.some((b) => b.table_number === number && toMinutes(b.slot) <= minutes && minutes < toMinutes(b.end_slot))) return { status: 'booked', source: 'booking' };
  if (mark) return { status: named(mark.status), source: 'camera' };
  return { status: 'free', source: null };
}

