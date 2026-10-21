/** Minimal Server-Sent Events helpers shared by the AI streaming routes. */
export interface SseEvent {
  event: string;
  data: string;
}

const encoder = new TextEncoder();
export const sseFrame = (event: string, data: unknown) => encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export const sseHeaders = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'private, no-store, no-transform',
  'X-Accel-Buffering': 'no',
  Vary: 'Cookie',
};

/** Parses an SSE byte stream into events; `data:` lines of one event are joined with \n. */
export async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let cut: number;
      while ((cut = buffer.search(/\r?\n\r?\n/)) >= 0) {
        const block = buffer.slice(0, cut);
        buffer = buffer.slice(cut).replace(/^\r?\n\r?\n/, '');
        let event = 'message';
        const data: string[] = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
        }
        if (data.length) yield { event, data: data.join('\n') };
      }
      if (done) return;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Splits streamed model text at a marker that separates the visible reply from trailing
 * JSON. Text is released as soon as it cannot be the beginning of the marker.
 */
export class MarkerSplitter {
  private pending = '';
  private found = false;
  tail = '';
  constructor(private marker: string) {}
  push(chunk: string): string {
    if (this.found) {
      this.tail += chunk;
      return '';
    }
    this.pending += chunk;
    const at = this.pending.indexOf(this.marker);
    if (at >= 0) {
      this.found = true;
      this.tail = this.pending.slice(at + this.marker.length);
      const out = this.pending.slice(0, at);
      this.pending = '';
      return out;
    }
    // Hold back a suffix that could still grow into the marker.
    let keep = 0;
    for (let n = Math.min(this.marker.length - 1, this.pending.length); n > 0; n--)
      if (this.marker.startsWith(this.pending.slice(-n))) {
        keep = n;
        break;
      }
    const out = this.pending.slice(0, this.pending.length - keep);
    this.pending = this.pending.slice(this.pending.length - keep);
    return out;
  }
  flush(): string {
    const out = this.found ? '' : this.pending;
    this.pending = '';
    return out;
  }
}
