import { identity } from '../../../access';
import { ApiError, json, failure, body } from '../../../http';
import { telegramConfigured } from '../../../telegram';
import { setupMiniApp } from '../../../telegram-menu';
export const dynamic = 'force-dynamic';

/** Admin only: sets the bot's menu button to the Mini App (setChatMenuButton) and its commands. */
export async function POST(request: Request) {
  try {
    await body(request);
    const u = await identity();
    if (u?.role !== 'admin') throw new ApiError(403, 'Faqat administrator uchun.');
    if (!telegramConfigured()) throw new ApiError(503, 'Telegram bot tokeni sozlanmagan.');
    const result = await setupMiniApp();
    if (!result.menuButton) throw new ApiError(502, 'Telegram menyu tugmasini qabul qilmadi. Keyinroq qayta urinib ko‘ring.');
    return json({ ok: true, ...result });
  } catch (e) {
    return failure(e);
  }
}
