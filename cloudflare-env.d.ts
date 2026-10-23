declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** Server-side only: table occupancy vision (gpt-4o-mini). */
    OPENAI_API_KEY?: string;
    OPENAI_VISION_MODEL?: string;
    /** Telegram booking notifications. */
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_WEBHOOK_SECRET?: string;
    TELEGRAM_BOT_USERNAME?: string;
    /** Click SHOP-API deposits. */
    CLICK_SERVICE_ID?: string;
    CLICK_MERCHANT_ID?: string;
    CLICK_SECRET_KEY?: string;
    /** Payme Merchant API deposits. */
    PAYME_MERCHANT_ID?: string;
    PAYME_KEY?: string;
    /** Eskiz.uz SMS for booking phone OTP; BOOKING_PHONE_OTP='true' makes it mandatory. */
    ESKIZ_EMAIL?: string;
    ESKIZ_PASSWORD?: string;
    ESKIZ_SECRET_KEY?: string;
    ESKIZ_FROM?: string;
    BOOKING_PHONE_OTP?: string;
    /** Shared with the Supabase Edge Function so only this Worker may call it. */
    RF_PROXY_SECRET?: string;
  }
}
