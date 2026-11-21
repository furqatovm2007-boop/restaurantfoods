import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { runCallAi } from "../app/call-ai";
import { runBirthdays } from "../app/birthday";
import { securityTxt } from "../app/security-txt";
import { recordServerError, runHealthCheck } from "../app/health";
import { runBotSync } from "../app/telegram-menu";
import { runHourPing } from "../app/hour-ping";
import { sweepP2P } from "../app/p2p";
import { ensureDemoAmanda } from "../app/mvp";
import { advanceOffers } from "../app/courier-dispatch";
import { runWithContext } from "../lib/after-response";

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const path = new URL(request.url).pathname;
    if ((path === "/.well-known/security.txt" || path === "/security.txt") && (request.method === "GET" || request.method === "HEAD")) return securityTxt();
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    // ctx is kept for the request (lib/after-response.ts): the courier offer's 10-second timer runs after the answer.
    const response = await runWithContext(ctx, () => runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx)));
    // Courier offers whose 10 seconds ran out move on to the next courier (checked at most every 5 s per isolate).
    if (path.startsWith("/api/")) ctx.waitUntil(runWithContext(ctx, () => advanceOffers()).catch(() => {}));
    // Health watch: 5xx API responses are counted after the response (see app/health.ts).
    if (response.status >= 500 && path.startsWith("/api/")) ctx.waitUntil(recordServerError().catch(() => {}));
    return response;
  },
  // Cron trigger (vite.config.ts): Call AI confirmation calls 2 hours before bookings, the daily
  // birthday promos (10:00 Tashkent) and the health watch.
  scheduled(_controller: ScheduledController, _env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(runCallAi().catch(() => console.error(JSON.stringify({ event: "call_ai_failed" }))));
    // 1 hour before every booking: "Kelasizmi?" in the guest's Telegram, the answer to the restaurant.
    // Central-card prepayment: a table held 30 minutes for a transfer that never came is released.
    ctx.waitUntil(sweepP2P().catch(() => console.error(JSON.stringify({ event: "p2p_sweep_failed" }))));
    ctx.waitUntil(runHourPing().catch(() => console.error(JSON.stringify({ event: "hour_ping_failed" }))));
    ctx.waitUntil(runBirthdays().catch(() => console.error(JSON.stringify({ event: "birthday_failed" }))));
    // Health watch: Telegram webhook and API error bursts → a Telegram message to the administrator.
    ctx.waitUntil(runHealthCheck().catch(() => console.error(JSON.stringify({ event: "health_check_failed" }))));
    // Bot menu: commands + menu button once per release, and the one-time announcement with the new keyboard.
    ctx.waitUntil(runBotSync().catch(() => console.error(JSON.stringify({ event: "bot_sync_failed" }))));
    // SIMPLE_MVP_MODE: the featured demo restaurant (app/mvp.ts), created once.
    // Courier offers: expired ones move on, orders still without a courier are offered again.
    ctx.waitUntil(runWithContext(ctx, () => advanceOffers(true)).catch(() => console.error(JSON.stringify({ event: "dispatch_sweep_failed" }))));
    ctx.waitUntil(ensureDemoAmanda().catch(() => console.error(JSON.stringify({ event: "demo_seed_failed" }))));
  },
};
