/*
 * Table occupancy from a camera frame with OpenAI vision. The frame is sent once and
 * never stored; only per-table status and confidence are written to the database.
 */
export interface VisionTable {
  number: number;
  floor: number;
  seats: number;
  x: number;
  y: number;
  shape: string;
}
export interface TableReading {
  number: number;
  status: 'free' | 'occupied' | 'unknown';
  confidence: number;
}

export const MIN_CONFIDENCE = 0.55;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
/** Base64 length of a ~1.5 MB frame; enough for a 1280px JPEG. */
export const MAX_IMAGE_BASE64 = 2_000_000;

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['tables'],
  properties: {
    tables: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['number', 'status', 'confidence'],
        properties: {
          number: { type: 'integer' },
          status: { type: 'string', enum: ['free', 'occupied', 'unknown'] },
          confidence: { type: 'number' },
        },
      },
    },
  },
};

export function visionRequest(model: string, tables: VisionTable[], image: string, mimeType: string, detail: 'low' | 'high') {
  const layout = tables.map((t) => `#${t.number}: ${t.seats} seats, ${t.shape}, floor ${t.floor}, plan position ${t.x}% from left, ${t.y}% from top`).join('\n');
  return {
    model,
    store: false,
    temperature: 0,
    max_completion_tokens: 600,
    response_format: { type: 'json_schema', json_schema: { name: 'table_occupancy', strict: true, schema } },
    messages: [
      {
        role: 'system',
        content:
          'You check restaurant table occupancy from one security-camera frame. A table is "occupied" when guests sit at it or it clearly holds their food, drinks or belongings; "free" when nobody uses it and it is set or empty; "unknown" when it is not visible, blocked or too dark. Do not describe or identify people. Report only the listed table numbers. Confidence is 0..1.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Tables expected in this camera view (positions are from the floor plan, the camera angle may differ):\n' + layout },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}`, detail } },
        ],
      },
    ],
  };
}

/** Keeps only known tables with a confident answer; everything else is left untouched. */
export function readings(raw: unknown, tables: VisionTable[]): TableReading[] {
  const known = new Set(tables.map((t) => t.number));
  const list = (raw as { tables?: unknown })?.tables;
  if (!Array.isArray(list)) return [];
  const seen = new Set<number>();
  return list.flatMap((item: any) => {
    const number = item?.number;
    const confidence = Math.max(0, Math.min(1, Number(item?.confidence) || 0));
    if (!Number.isInteger(number) || !known.has(number) || seen.has(number)) return [];
    if (!['free', 'occupied', 'unknown'].includes(item?.status) || confidence < MIN_CONFIDENCE) return [];
    seen.add(number);
    return [{ number, status: item.status, confidence }];
  });
}
