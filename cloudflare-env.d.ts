declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** Server-side only: table occupancy vision (gpt-4o-mini). */
    OPENAI_API_KEY?: string;
    OPENAI_VISION_MODEL?: string;
  }
}
