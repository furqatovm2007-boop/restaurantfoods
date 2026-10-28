import { identity } from '../../../access';
import { ApiError, json, failure, body } from '../../../http';
import { telegramConfigured } from '../../../telegram';
import { ensureBotSetup, syncOldUsers } from '../../../telegram-menu';
export const dynamic = 'force-dynamic';

/**
 * Admin only: the one-time announcement with the new keyboard to every linked Telegram chat (the cron does
 * the same in batches after a deploy; this runs the next batch now and reports the progress).
 */
export async function POST(request: Request) {
  try {
    await body(request);
    const u = await identity();
    if (u?.role !== 'admin') throw new ApiError(403, 'Faqat administrator uchun.');
    if (!telegramConfigured()) throw new ApiError(503, 'Telegram bot tokeni sozlanmagan.');
    await ensureBotSetup();
    return json({ ok: true, ...(await syncOldUsers(100)) });
  } catch (e) {
    return failure(e);
  }
}
