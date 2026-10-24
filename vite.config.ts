import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { sites } from "./build/sites-vite-plugin";
import { connectorPreview } from "./build/connector-preview-plugin.mjs";

/*
 * Cloudflare resources of the self-hosted deployment (Workers Builds from GitHub).
 * The Worker name must match the Worker connected in the Cloudflare dashboard.
 * IDs are not secrets; secrets (OPENAI_API_KEY, …) live in the dashboard only.
 */
const CLOUDFLARE = {
  workerName: "restaurantfoods",
  d1: { name: "restaurantfoods-db", id: "6f40dc57-ec4a-463d-8d3c-455135091c48" },
  r2: { bucket: "restaurantfoods-media" },
};

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const localBindingConfig = {
  name: CLOUDFLARE.workerName,
  main: "./build/sites-worker.ts",
  compatibility_flags: ["nodejs_compat"],
  // Public Supabase settings. TURNSTILE_SITE_KEY and optional AUTH_*_ENABLED flags are set
  // in the dashboard (Settings → Variables); keep_vars stops deploys from erasing them.
  keep_vars: true,
  // Workers Logs: SMS/payment failures (no codes or phone numbers) are readable in the dashboard.
  observability: { enabled: true },
  // Call AI: every 5 minutes, confirmation calls for bookings starting within 2 hours.
  triggers: { crons: ["*/5 * * * *"] },
  // Workers AI: the free internal reserve engine when OpenAI is unavailable (app/ai-fallback.ts).
  ai: { binding: "AI" },
  vars: {
    SUPABASE_URL: "https://edfpytsribkqxtdfimww.supabase.co",
    SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZnB5dHNyaWJrcXh0ZGZpbXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5ODM3OTAsImV4cCI6MjEwNzU1OTc5MH0.6FBK9aGsEXA_-Pb99jmfiS-dx7SwuXa13Er4DLefpU0",
    AUTH_SETUP_COMPLETE: "true",
    AUTH_GOOGLE_ENABLED: "true",
    // Phone verification codes (booking + profile). Codes go to the customer's Telegram chat; SMS
    // joins in automatically once the Eskiz keys are set. This overrides the dashboard on every deploy.
    BOOKING_PHONE_OTP: "true",
  },
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: CLOUDFLARE.d1.name,
          database_id: CLOUDFLARE.d1.id,
          migrations_dir: "drizzle",
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: CLOUDFLARE.r2.bucket,
        },
      ]
    : [],
};

export default defineConfig(async ({ command }) => {
  // Use Miniflare's local Request.cf placeholder unless fetching is requested.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      ...(managedLinux
        ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] }
        : {}),
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites({ mockAuth: !managedLinux }),
      connectorPreview(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          ...localBindingConfig,
          ...(command === "serve"
            ? {
                services: [
                  {
                    binding: "CONNECTORS",
                    service: "sites-connector-preview",
                    entrypoint: "ConnectorPreview",
                  },
                ],
              }
            : {}),
        },
        ...(command === "serve"
          ? {
              auxiliaryWorkers: [
                {
                  config: {
                    name: "sites-connector-preview",
                    main: "./build/connector-preview-worker.mjs",
                    compatibility_date: "2026-05-15",
                  },
                },
              ],
            }
          : {}),
      }),
    ],
  };
});
