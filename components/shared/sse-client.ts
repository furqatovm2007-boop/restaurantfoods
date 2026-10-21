/** Browser side of the SSE endpoints: POSTs JSON and reports `delta` text as it arrives. */
export interface StreamResult {
  reply: string;
  [key: string]: unknown;
}

export class StreamError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
  }
}

export async function postStream(url: string, payload: unknown, onDelta: (text: string, full: string) => void, signal?: AbortSignal): Promise<StreamResult> {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal });
  if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
    let error = 'AI_UNAVAILABLE';
    try {
      error = ((await response.json()) as { error?: string }).error || error;
    } catch {
      /* non-JSON error page */
    }
    throw new StreamError(error, response.status);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
    let cut: number;
    while ((cut = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      const event = /^event: (.*)$/m.exec(block)?.[1] ?? 'message';
      const raw = /^data: (.*)$/m.exec(block)?.[1];
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (event === 'delta') {
        full += data.text;
        onDelta(data.text, full);
      } else if (event === 'done') return data as StreamResult;
      else if (event === 'error') throw new StreamError(data.error || 'AI_UNAVAILABLE');
    }
    if (done) throw new StreamError('AI_UNAVAILABLE');
  }
}
