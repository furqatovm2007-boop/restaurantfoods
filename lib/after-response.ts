import { AsyncLocalStorage } from "node:async_hooks";

/*
 * Work that must go on after the answer is sent (the courier offer's 10-second timer): the Worker's
 * ExecutionContext of the current request, kept per request (build/sites-worker.ts) so app code can call
 * afterResponse(task). Outside a request (tests) the task is not started.
 */
const store = new AsyncLocalStorage<{ waitUntil(p: Promise<unknown>): void } | undefined>();
export function runWithContext<T>(ctx: { waitUntil(p: Promise<unknown>): void } | undefined, run: () => T): T {
  return store.run(ctx, run);
}
export function afterResponse(task: () => Promise<unknown>) {
  const ctx = store.getStore();
  if (!ctx) return; // no request to outlive (tests): the cron's sweep moves the offer on instead
  ctx.waitUntil(task().catch(() => console.error(JSON.stringify({ event: "after_response_failed" }))));
}
