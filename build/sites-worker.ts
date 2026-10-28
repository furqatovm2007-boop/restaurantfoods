import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { runCallAi } from "../app/call-ai";
import { runBirthdays } from "../app/birthday";
import { securityTxt } from "../app/security-txt";
import { recordServerError, runHealthCheck } from "../app/health";
import { runBotSync } from "../app/telegram-menu";

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
    const response = await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
    // Health watch: 5xx API responses are counted after the response (see app/health.ts).
    if (response.status >= 500 && path.startsWith("/api/")) ctx.waitUntil(recordServerError().catch(() => {}));
    return response;
  },
  // Cron trigger (vite.config.ts): Call AI confirmation calls 2 hours before bookings, the daily
  // birthday promos (10:00 Tashkent) and the health watch.
  scheduled(_controller: ScheduledController, _env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(runCallAi().catch(() => console.error(JSON.stringify({ event: "call_ai_failed" }))));
    ctx.waitUntil(runBirthdays().catch(() => console.error(JSON.stringify({ event: "birthday_failed" }))));
    // Health watch: Telegram webhook and API error bursts → a Telegram message to the administrator.
    ctx.waitUntil(runHealthCheck().catch(() => console.error(JSON.stringify({ event: "health_check_failed" }))));
    // Bot menu: commands + menu button once per release, and the one-time announcement with the new keyboard.
    ctx.waitUntil(runBotSync().catch(() => console.error(JSON.stringify({ event: "bot_sync_failed" }))));
  },
};
